'use server';

import { supabase } from '@/lib/supabase';

export interface RecipeSearchResult {
  id: string;
  name: string;
  category: string;
  sub_category: string;
  cooking_time: number;
  calories: number;
  image_url: string;
  difficulty?: string;
  is_personal?: boolean;
  match_count?: number;
  created_at?: string;
}

export interface RecipeInput {
  name: string;
  description?: string;
  category?: string;
  sub_category?: string;
  cooking_time: number;
  difficulty: string;
  servings: number;
  ingredients: { name: string; amount: string }[];
  steps: string[];
  image_file?: string; // Base64 or reference
}

export async function searchRecipes(queryIngredients: string[]): Promise<RecipeSearchResult[]> {
  if (!queryIngredients || queryIngredients.length === 0) return [];

  // 1. Normalize query ingredients (lowercase and trim)
  const normalizedQuery = queryIngredients.map(i => i.toLowerCase().trim());
  console.log('[searchRecipes] Normalized query:', normalizedQuery);

  // 2. Find Ingredient IDs for the query
  const { data: ingredientsData, error: ingError } = await supabase
    .from('ingredients')
    .select('id, name')
    .in('name', normalizedQuery);

  if (ingError || !ingredientsData || ingredientsData.length === 0) {
    console.error('[searchRecipes] Error fetching ingredient IDs or none found:', ingError);
    return [];
  }

  console.log(`[searchRecipes] Found ${ingredientsData.length}/${normalizedQuery.length} ingredients in DB:`, ingredientsData.map(i => i.name));
  const ingredientIds = ingredientsData.map(i => i.id);

  // 3. Find Recipe IDs that match these ingredients
  // We want to count how many ingredients match for each recipe
  const { data: matchingData, error: matchError } = await supabase
    .from('recipe_ingredients')
    .select('recipe_id')
    .in('ingredient_id', ingredientIds);

  if (matchError || !matchingData || matchingData.length === 0) {
    console.error('[searchRecipes] Error finding matching recipes or none matched:', matchError);
    return [];
  }

  // Count matches per recipe
  const matchCounts: Record<string, number> = {};
  matchingData.forEach(m => {
    matchCounts[m.recipe_id] = (matchCounts[m.recipe_id] || 0) + 1;
  });

  // Filter recipes based on match count threshold
  const threshold = queryIngredients.length >= 2 ? 2 : 1;
  const filteredRecipeIds = Object.keys(matchCounts).filter(id => matchCounts[id] >= threshold);
  console.log(`[searchRecipes] Threshold: ${threshold}, matched ${filteredRecipeIds.length} unique recipe(s) before limit.`);

  // Sort recipe IDs by match count (descending)
  const sortedRecipeIds = filteredRecipeIds.sort((a, b) => matchCounts[b] - matchCounts[a]);

  // 4. Fetch full recipe details for the top results (limit to 10 for performance)
  const topIds = sortedRecipeIds.slice(0, 10);
  const { data: recipesData, error: recipeError } = await supabase
    .from('recipes')
    .select('id, name, category, sub_category, cooking_time, calories, image_url, difficulty')
    .in('id', topIds);

  if (recipeError || !recipesData) {
    console.error('[searchRecipes] Error fetching recipes data:', recipeError);
    return [];
  }

  // Map back with match counts and preserve order
  const finalResults = topIds.map(id => {
    const r = recipesData.find(recipe => recipe.id === id);
    return {
      ...r,
      match_count: matchCounts[id]
    } as RecipeSearchResult;
  }).filter(r => r.id); // Filter out any undefines if IDs didn't match

  console.log(`[searchRecipes] Final result: ${finalResults.length} recipe(s) returned.`);
  return finalResults;
}

export async function getRecipeDetail(id: string) {
  console.log('[getRecipeDetail] Fetching detail for recipe id:', id);
  const { data, error } = await supabase
    .from('recipes')
    .select(`
      *,
      recipe_ingredients (
        amount,
        is_main,
        ingredients ( name )
      ),
      recipe_tags ( tag )
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('[getRecipeDetail] Error fetching recipe detail:', error);
    return null;
  }

  console.log('[getRecipeDetail] Success. Ingredients count:', data?.recipe_ingredients?.length ?? 0);
  return data;
}

export async function getPersonalRecipes(): Promise<RecipeSearchResult[]> {
  console.log('[getPersonalRecipes] Fetching is_personal=true recipes...');
  const { data, error } = await supabase
    .from('recipes')
    .select('id, name, category, sub_category, cooking_time, calories, image_url, created_at, difficulty, is_personal')
    .eq('is_personal', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[getPersonalRecipes] Error fetching personal recipes:', error);
    return [];
  }

  console.log(`[getPersonalRecipes] Found ${data.length} recipe(s).`);
  return data.map(r => ({ ...r })) as RecipeSearchResult[];
}

export async function createRecipe(formData: FormData) {
  const name = formData.get('name') as string;
  console.log('[createRecipe] Creating recipe:', name);
  try {
    const description = formData.get('description') as string;
    const cookingTime = parseInt(formData.get('cookingTime') as string);
    const difficulty = formData.get('difficulty') as string;
    const servings = parseInt(formData.get('servings') as string);
    const ingredientsJson = formData.get('ingredients') as string;
    const stepsJson = formData.get('steps') as string;
    const imageFile = formData.get('image') as File;

    const ingredients = JSON.parse(ingredientsJson);
    const steps = JSON.parse(stepsJson);
    console.log(`[createRecipe] Parsed: ${ingredients.length} ingredient(s), ${steps.length} step(s).`);

    // 1. Upload Image if exists
    let imageUrl = '';
    if (imageFile && imageFile.size > 0) {
      console.log('[createRecipe] Uploading image:', imageFile.name, `(${imageFile.size} bytes)`);
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Math.random()}-${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('recipe-images')
        .upload(fileName, imageFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('recipe-images')
        .getPublicUrl(uploadData.path);

      imageUrl = publicUrl;
      console.log('[createRecipe] Image uploaded, public URL:', publicUrl);
    }

    // 2. Insert Recipe
    const recipeId = `user-${Math.random().toString(36).substring(2, 9)}`;
    const { error: recipeError } = await supabase
      .from('recipes')
      .insert({
        id: recipeId,
        name,
        description,
        cooking_time: cookingTime,
        difficulty,
        servings,
        steps,
        image_url: imageUrl,
        is_personal: true,
        category: 'user-contributed'
      });

    if (recipeError) throw recipeError;
    console.log('[createRecipe] Recipe inserted with id:', recipeId);

    // 3. Handle Ingredients
    for (const ing of ingredients) {
      // Upsert into ingredients table
      const { data: ingData, error: ingError } = await supabase
        .from('ingredients')
        .upsert({ name: ing.name.toLowerCase().trim() }, { onConflict: 'name' })
        .select()
        .single();

      if (ingError) {
        console.warn('[createRecipe] Could not upsert ingredient:', ing.name, ingError);
        continue;
      }

      // Link to recipe
      await supabase.from('recipe_ingredients').insert({
        recipe_id: recipeId,
        ingredient_id: ingData.id,
        amount: ing.amount,
        is_main: true
      });
    }

    console.log('[createRecipe] Done. Recipe created successfully:', recipeId);
    return { success: true, id: recipeId };
  } catch (error: any) {
    console.error('[createRecipe] Error creating recipe:', error);
    return { success: false, error: error.message };
  }
}

export async function getRecipesByIds(ids: string[]): Promise<RecipeSearchResult[]> {
  if (!ids || ids.length === 0) return [];

  console.log('[getRecipesByIds] Fetching recipes for ids:', ids);
  const { data, error } = await supabase
    .from('recipes')
    .select('id, name, category, sub_category, cooking_time, calories, image_url, difficulty')
    .in('id', ids);

  if (error || !data) {
    console.error('[getRecipesByIds] Error fetching recipes by IDs:', error);
    return [];
  }

  console.log(`[getRecipesByIds] Returned ${data.length}/${ids.length} recipes.`);
  return data as RecipeSearchResult[];
}
