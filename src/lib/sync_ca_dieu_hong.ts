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
  console.log("🚀 Starting sync process for Cá diêu hồng recipes...");

  const dataPath = path.join(process.cwd(), 'src/lib/recipes_data.json');
  const recipes = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

  // Filter for Cá diêu hồng recipes only
  const newRecipes = recipes.filter((r: any) => r.id.startsWith('ca-dieu-hong-'));
  
  if (newRecipes.length === 0) {
    console.log("⚠️ No new recipes found to sync.");
    return;
  }

  console.log(`✅ Found ${newRecipes.length} recipes to sync`);

  // 1. Upsert Ingredients
  console.log('🔄 Upserting ingredients...');
  const allIngredients = new Set<string>();
  newRecipes.forEach((recipe: any) => {
    const ingObj = recipe.ingredients || { main: [], optional: [] };
    const ingredients = [
      ...(ingObj.main || []),
      ...(ingObj.optional || [])
    ];
    ingredients.forEach((ing: string) => {
      const cleaned = cleanIngredient(ing);
      const normalized = normalizeIngredient(cleaned);
      allIngredients.add(normalized);
    });
  });

  const ingArray = Array.from(allIngredients).map(name => ({ name }));
  const { data: ingData, error: ingError } = await supabase
    .from('ingredients')
    .upsert(ingArray, { onConflict: 'name', ignoreDuplicates: true })
    .select();

  if (ingError) {
    console.error('❌ Error upserting ingredients:', ingError);
    return;
  }
  console.log(`✅ Upserted ${ingArray.length} ingredients`);

  // Build ingredient map
  const { data: fetchedIngs } = await supabase.from('ingredients').select('id, name');
  const ingMap = new Map<string, string>();
  fetchedIngs?.forEach((ing: any) => ingMap.set(ing.name, ing.id));

  // 2. Upsert Recipes
  console.log('🔄 Upserting recipes...');
  const recipeInserts = newRecipes.map((r: any) => ({
    id: r.id,
    name: r.name,
    category: r.category || 'mon-ca',
    sub_category: r.subCategory || 'ca-dieu-hong',
    steps: r.steps || [],
    cooking_time: r.cookingTime || r.time || 25,
    difficulty: r.difficulty || 'de',
    servings: r.servings || 4,
    region: r.region || 'toan-quoc',
    calories: r.calories || 0,
    tips: r.tips || '',
    image_url: r.imageUrl || `/images/${r.id}.jpg`,
    description: r.description || '',
    is_personal: false
  }));

  const { error: recipeError } = await supabase
    .from('recipes')
    .upsert(recipeInserts, { onConflict: 'id', ignoreDuplicates: true });

  if (recipeError) {
    console.error('❌ Error upserting recipes:', recipeError);
    return;
  }
  console.log(`✅ Upserted ${recipeInserts.length} recipes`);

  // 3. Link Recipe Tags directly (no separate tags table)
  console.log('🔄 Linking recipe tags...');
  const recipeTagLinks = [];
  for (const r of newRecipes) {
    const tags = Array.isArray(r.tags) ? r.tags : [r.tags];
    for (const tag of tags) {
      recipeTagLinks.push({ recipe_id: r.id, tag });
    }
  }

  const { error: rtError } = await supabase
    .from('recipe_tags')
    .upsert(recipeTagLinks, { onConflict: 'recipe_id,tag', ignoreDuplicates: true });

  if (rtError) {
    console.error('❌ Error linking tags:', rtError);
    return;
  }
  console.log(`✅ Linked ${recipeTagLinks.length} recipe tags`);

  // 5. Link Recipe Ingredients
  console.log('🔄 Linking recipe ingredients...');
  const recipeIngLinks = [];
  for (const r of newRecipes) {
    const ingObj = r.ingredients || { main: [], optional: [] };
    // Main ingredients
    for (const ing of (ingObj.main || [])) {
      const normalized = normalizeIngredient(cleanIngredient(ing));
      const ingId = ingMap.get(normalized);
      if (ingId) {
        recipeIngLinks.push({ recipe_id: r.id, ingredient_id: ingId, is_main: true, amount: ing });
      }
    }
    // Optional ingredients
    for (const ing of (ingObj.optional || [])) {
      const normalized = normalizeIngredient(cleanIngredient(ing));
      const ingId = ingMap.get(normalized);
      if (ingId) {
        recipeIngLinks.push({ recipe_id: r.id, ingredient_id: ingId, is_main: false, amount: ing });
      }
    }
  }

  const { error: riError } = await supabase
    .from('recipe_ingredients')
    .upsert(recipeIngLinks, { onConflict: 'recipe_id,ingredient_id', ignoreDuplicates: true });

  if (riError) {
    console.error('❌ Error linking ingredients:', riError);
    return;
  }
  console.log(`✅ Linked ${recipeIngLinks.length} recipe ingredients`);

  console.log('🎉 Sync complete!');
}

syncNewRecipes().catch(console.error);
