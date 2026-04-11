import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase URL or Key in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seed() {
  console.log("🚀 Starting seeding process...");

  const dataPath = path.join(process.cwd(), 'src/lib/recipes_data.json');
  const recipes = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  // 1. Extract Unique Ingredients
  console.log("📦 Extracting unique ingredients...");
  const ingredientSet = new Set<string>();
  recipes.forEach((r: any) => {
    r.ingredients.main?.forEach((i: string) => ingredientSet.add(cleanIngredient(i)));
    r.ingredients.optional?.forEach((i: string) => ingredientSet.add(cleanIngredient(i)));
  });

  const uniqueIngredients = Array.from(ingredientSet).map(name => ({ name }));

  const { data: insertedIngredients, error: ingError } = await supabase
    .from('ingredients')
    .upsert(uniqueIngredients, { onConflict: 'name' })
    .select();

  if (ingError) throw ingError;
  console.log(`✅ Seeded ${insertedIngredients?.length} unique ingredients.`);

  // Create a map for quick lookup
  const ingMap = new Map(insertedIngredients?.map(i => [i.name, i.id]));

  // 2. Seed Recipes, Tags, and Junction Table
  console.log("🍲 Seeding recipes and relationships...");

  for (const r of recipes) {
    // Insert Recipe
    const { error: recipeError } = await supabase
      .from('recipes')
      .upsert({
        id: r.id,
        name: r.name,
        category: r.category,
        sub_category: r.subCategory,
        steps: r.steps,
        cooking_time: r.cookingTime,
        difficulty: r.difficulty,
        servings: r.servings,
        region: r.region,
        calories: r.calories,
        tips: r.tips
      });

    if (recipeError) {
      console.error(`Error inserting recipe ${r.name}:`, recipeError);
      continue;
    }

    // Insert Tags
    if (r.tags && Array.isArray(r.tags)) {
      const tags = r.tags.map(tag => ({ recipe_id: r.id, tag }));
      await supabase.from('recipe_tags').upsert(tags);
    } else if (typeof r.tags === 'string') {
      await supabase.from('recipe_tags').upsert({ recipe_id: r.id, tag: r.tags });
    }

    // Insert Recipe-Ingredients
    const recipeIngsMap = new Map<string, any>();
    
    // Process main ingredients
    r.ingredients.main?.forEach((raw: string) => {
      const name = cleanIngredient(raw);
      const id = ingMap.get(name);
      if (id) {
        recipeIngsMap.set(id, { recipe_id: r.id, ingredient_id: id, is_main: true, amount: raw });
      }
    });

    // Process optional ingredients (will only add if not already in main)
    r.ingredients.optional?.forEach((raw: string) => {
      const name = cleanIngredient(raw);
      const id = ingMap.get(name);
      if (id && !recipeIngsMap.has(id)) {
        recipeIngsMap.set(id, { recipe_id: r.id, ingredient_id: id, is_main: false, amount: raw });
      }
    });

    const recipeIngs = Array.from(recipeIngsMap.values());

    if (recipeIngs.length > 0) {
      const { error: junctionError } = await supabase.from('recipe_ingredients').upsert(recipeIngs);
      if (junctionError) console.error(`Error linking ingredients for ${r.name}:`, junctionError);
    }
  }

  console.log("✨ Seeding completed successfully!");
}

// Utility to clean ingredient string (e.g. "500g thịt bò" -> "thịt bò")
function cleanIngredient(str: string): string {
  // Simple regex to remove common amount prefixes (can be improved)
  return str.replace(/^\d+(\w+)?\s+/, '').replace(/^[\d/,.]+\s+(thìa|quả|miếng|g|kg|lít|tép|cây|lá|bìa|củ|bát|tai)\s+/, '').trim().toLowerCase();
}

seed().catch(err => {
  console.error("❌ Seeding failed:", err);
});
