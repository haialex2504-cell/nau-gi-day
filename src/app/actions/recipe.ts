'use server';

import { supabase } from '@/lib/supabase';
import { resolveIngredients } from '@/lib/synonyms';

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
  score?: number;
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

  // ── BƯỚC 1: Resolve đồng nghĩa + bao hàm ─────────────────────────────
  // "thịt lợn" → "thịt heo"
  // "nấm"      → ["nấm hương", "nấm đông cô", "nấm đùi gà", ...]
  const resolvedTerms = resolveIngredients(queryIngredients);
  console.log('[searchRecipes] Input:', queryIngredients, '→ Resolved:', resolvedTerms);

  // ── BƯỚC 2: Tìm ingredient IDs ────────────────────────────────────────
  // Với mỗi term: exact match trước, ilike fallback nếu không có
  const allIngredientIds = new Set<string>();

  for (const term of resolvedTerms) {
    const q = term.toLowerCase().trim();

    // Exact match
    const { data: exactData } = await supabase
      .from('ingredients')
      .select('id, name')
      .eq('name', q);

    if (exactData && exactData.length > 0) {
      exactData.forEach(i => allIngredientIds.add(i.id));
      console.log(`[searchRecipes] ✅ Exact: "${q}" →`, exactData.map(i => i.name));
    } else {
      // Fuzzy/partial fallback (ilike)
      const { data: fuzzyData } = await supabase
        .from('ingredients')
        .select('id, name')
        .ilike('name', `%${q}%`)
        .limit(8);

      if (fuzzyData && fuzzyData.length > 0) {
        fuzzyData.forEach(i => allIngredientIds.add(i.id));
        console.log(`[searchRecipes] 🔍 Fuzzy: "${q}" →`, fuzzyData.map(i => i.name));
      } else {
        console.warn(`[searchRecipes] ❌ No match for "${q}"`);
      }
    }
  }

  if (allIngredientIds.size === 0) {
    console.error('[searchRecipes] No ingredient IDs resolved from any term.');
    return [];
  }

  const ingredientIds = Array.from(allIngredientIds);
  console.log(`[searchRecipes] Total ingredient IDs:`, ingredientIds.length);

  // ── BƯỚC 3: Tìm các recipe có chứa ít nhất 1 nguyên liệu khớp ────────
  const { data: matchingData, error: matchError } = await supabase
    .from('recipe_ingredients')
    .select('recipe_id')
    .in('ingredient_id', ingredientIds);


  if (matchError || !matchingData || matchingData.length === 0) {
    console.error('[searchRecipes] No matching recipes:', matchError);
    return [];
  }

  // Đếm số nguyên liệu khớp cho mỗi recipe
  const matchedCount: Record<string, number> = {};
  matchingData.forEach(m => {
    matchedCount[m.recipe_id] = (matchedCount[m.recipe_id] || 0) + 1;
  });
  const matchedRecipeIds = Object.keys(matchedCount);
  console.log(`[searchRecipes] Found ${matchedRecipeIds.length} candidate recipe(s).`);

  // ── BƯỚC 4: Lấy tổng nguyên liệu CHÍNH (is_main=true) của mỗi recipe──
  // Dùng làm mẫu số match_ratio — nguyên liệu phụ (muối, dầu...) không tính
  const { data: totalData } = await supabase
    .from('recipe_ingredients')
    .select('recipe_id')
    .in('recipe_id', matchedRecipeIds)
    .eq('is_main', true);

  const totalMainCount: Record<string, number> = {};
  totalData?.forEach(r => {
    totalMainCount[r.recipe_id] = (totalMainCount[r.recipe_id] || 0) + 1;
  });

  // ── BƯỚC 5: Tính score có trọng số ────────────────────────────────────
  //
  //   match_ratio = matched / recipe_total_main   → recipe "đủ nguyên liệu" bao nhiêu %?
  //   coverage    = matched / user_total_input    → user "tìm được" bao nhiêu %?
  //   score       = match_ratio × 0.5 + coverage × 0.5
  //
  //   Ngưỡng hiển thị: score >= 0.4
  //   Nguyên liệu phụ (is_main=false) không tính vào mẫu số recipe
  //
  const userTotal = queryIngredients.length;
  const SCORE_THRESHOLD = 0.4;

  const scored = matchedRecipeIds
    .map(id => {
      const matched    = matchedCount[id] ?? 0;
      const total      = totalMainCount[id] ?? matched; // fallback nếu thiếu data
      const matchRatio = matched / Math.max(total, 1);
      const coverage   = matched / Math.max(userTotal, 1);
      const score      = matchRatio * 0.5 + coverage * 0.5;
      return { id, matched, total, score };
    })
    .filter(r => r.score >= SCORE_THRESHOLD)
    .sort((a, b) => b.score - a.score);

  console.log(
    `[searchRecipes] Scored (threshold=${SCORE_THRESHOLD}):`,
    scored.slice(0, 5).map(r =>
      `${r.id} matched=${r.matched}/${r.total} score=${r.score.toFixed(2)}`
    )
  );

  // ── BƯỚC 6: Fetch chi tiết top 20 recipe ──────────────────────────────
  const topIds = scored.slice(0, 20).map(r => r.id);
  if (topIds.length === 0) return [];

  const { data: recipesData, error: recipeError } = await supabase
    .from('recipes')
    .select('id, name, category, sub_category, cooking_time, calories, image_url, difficulty')
    .in('id', topIds);

  if (recipeError || !recipesData) {
    console.error('[searchRecipes] Error fetching recipe details:', recipeError);
    return [];
  }

  // Map theo thứ tự score đã sắp xếp, đính kèm match_count để UI hiển thị
  const scoreMap = Object.fromEntries(scored.map(r => [r.id, r]));
  const finalResults = topIds
    .map(id => {
      const r = recipesData.find(recipe => recipe.id === id);
      const s = scoreMap[id];
      return {
        ...r,
        match_count: s?.matched ?? 0,
      } as RecipeSearchResult;
    })
    .filter(r => r.id);

  console.log(`[searchRecipes] ✨ Final: ${finalResults.length} recipe(s) returned.`);
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
