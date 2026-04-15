import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { cleanIngredient } from './ingredientResolver';
import { normalizeIngredient } from './synonyms';

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase URL or Key in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function syncNewRecipes() {
  console.log("🚀 Starting sync process for new ca-ro-phi recipes...");

  const dataPath = path.join(process.cwd(), 'src/lib/recipes_data.json');
  const recipes = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  // Filter for new recipes only (ca-ro-phi-)
  const newRecipes = recipes.filter((r: any) => r.id.startsWith('ca-ro-phi-'));
  
  if (newRecipes.length === 0) {
    console.log("⚠️ No new recipes found to sync.");
    return;
  }

  console.log(`🔍 Found ${newRecipes.length} new recipes to sync.`);

  // 1. Extract and Upsert Ingredients
  console.log("📦 Extracting unique ingredients from new recipes...");
  const ingredientSet = new Set<string>();
  newRecipes.forEach((r: any) => {
    r.ingredients.main?.forEach((i: string) => ingredientSet.add(normalizeIngredient(cleanIngredient(i))));
    r.ingredients.optional?.forEach((i: string) => ingredientSet.add(normalizeIngredient(cleanIngredient(i))));
  });

  const uniqueIngredients = Array.from(ingredientSet).map(name => ({ name }));
  
  console.log(`🧼 Upserting ${uniqueIngredients.length} ingredients...`);
  const { data: insertedIngredients, error: ingError } = await supabase
    .from('ingredients')
    .upsert(uniqueIngredients, { onConflict: 'name' })
    .select();

  if (ingError) throw ingError;
  
  const { data: allIngs } = await supabase.from('ingredients').select('id, name');
  const ingMap = new Map(allIngs?.map(i => [i.name, i.id]));

  // 2. Prepare Batch Data
  console.log("🥣 Preparing batch data...");
  const recipesBatch: any[] = [];
  const tagsBatch: any[] = [];
  const associationsBatch: any[] = [];

  for (const r of newRecipes) {
    recipesBatch.push({
      id: r.id,
      name: r.name,
      category: r.category,
      sub_category: r.subCategory,
      steps: r.steps,
      cooking_time: r.cookingTime,
      difficulty: r.difficulty,
      servings: r.servings || 4,
      region: r.region,
      calories: r.calories,
      tips: r.tips || '',
      description: r.description || ''
    });

    if (r.tags) {
      const tags = Array.isArray(r.tags) ? r.tags : [r.tags];
      tags.forEach((tag: string) => {
        tagsBatch.push({ recipe_id: r.id, tag });
      });
    }

    const recipeIngsMap = new Map<string, any>();
    r.ingredients.main?.forEach((raw: string) => {
      const name = normalizeIngredient(cleanIngredient(raw));
      const id = ingMap.get(name);
      if (id) {
        recipeIngsMap.set(id, { recipe_id: r.id, ingredient_id: id, is_main: true, amount: raw });
      }
    });

    r.ingredients.optional?.forEach((raw: string) => {
      const name = normalizeIngredient(cleanIngredient(raw));
      const id = ingMap.get(name);
      if (id && !recipeIngsMap.has(id)) {
        recipeIngsMap.set(id, { recipe_id: r.id, ingredient_id: id, is_main: false, amount: raw });
      }
    });

    associationsBatch.push(...Array.from(recipeIngsMap.values()));
  }

  // 3. Batch Upsert to Supabase
  console.log(`🍲 Upserting ${recipesBatch.length} recipes...`);
  const { error: rError } = await supabase.from('recipes').upsert(recipesBatch);
  if (rError) throw rError;

  console.log(`🏷️ Upserting ${tagsBatch.length} tags...`);
  const { error: tError } = await supabase.from('recipe_tags').upsert(tagsBatch);
  if (tError) throw tError;

  console.log(`🔗 Upserting ${associationsBatch.length} recipe-ingredient associations...`);
  const { error: aError } = await supabase.from('recipe_ingredients').upsert(associationsBatch);
  if (aError) throw aError;

  console.log("✨ Sync completed successfully!");
}

syncNewRecipes().catch(err => {
  console.error("❌ Sync failed:", err);
});
