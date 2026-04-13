import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

async function debug() {
  const queries = ['trứng', 'thịt lợn'];

  const { data: ingredientsData } = await supabase
    .from('ingredients')
    .select('id, name')
    .in('name', queries);

  const ingredientIds = ingredientsData!.map(i => i.id);
  console.log('Ingredient IDs:', ingredientIds);

  // Check default limit (1000)
  const { data: matchingData } = await supabase
    .from('recipe_ingredients')
    .select('recipe_id')
    .in('ingredient_id', ingredientIds);

  console.log('Matching rows (default limit):', matchingData?.length);

  // Check count
  const { count } = await supabase
    .from('recipe_ingredients')
    .select('*', { count: 'exact', head: true })
    .in('ingredient_id', ingredientIds);

  console.log('Actual total count for these ingredients:', count);

  if (matchingData) {
    interface RecipeIngredientRow { recipe_id: string }
    const matchCounts: Record<string, number> = {};
    (matchingData as RecipeIngredientRow[]).forEach((m) => {
      matchCounts[m.recipe_id] = (matchCounts[m.recipe_id] || 0) + 1;
    });
    const threshold = queries.length >= 2 ? 2 : 1;
    const filtered = Object.keys(matchCounts).filter(id => matchCounts[id] >= threshold);
    console.log(`Threshold ${threshold}, recipes passing:`, filtered.length, filtered.slice(0,5));
    
    // Check if trứng & thịt lợn are individually in the same recipes
    const byIng: Record<string, string[]> = {};
    (matchingData as RecipeIngredientRow[]).forEach((m) => {
      if (!byIng[m.recipe_id]) byIng[m.recipe_id] = [];
    });
    console.log('Total unique recipes in matchingData:', Object.keys(byIng).length);
  }
}

debug().catch(console.error);
