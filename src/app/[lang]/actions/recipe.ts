'use server';

import { createClient } from '@/utils/supabase/server';
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
  user_id?: string;
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

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // ── BƯỚC 1: Resolve đồng nghĩa + bao hàm ─────────────────────────────
  const resolvedTerms = resolveIngredients(queryIngredients);

  // ── BƯỚC 2: Tìm ingredient IDs ────────────────────────────────────────
  const allIngredientIds = new Set<string>();

  for (const term of resolvedTerms) {
    const q = term.toLowerCase().trim();

    const { data: exactData } = await supabase
      .from('ingredients')
      .select('id, name')
      .eq('name', q);

    if (exactData && exactData.length > 0) {
      exactData.forEach(i => allIngredientIds.add(i.id));
    } else {
      const { data: fuzzyData } = await supabase
        .from('ingredients')
        .select('id, name')
        .ilike('name', `%${q}%`)
        .limit(8);

      if (fuzzyData && fuzzyData.length > 0) {
        fuzzyData.forEach(i => allIngredientIds.add(i.id));
      }
    }
  }

  if (allIngredientIds.size === 0) return [];

  const ingredientIds = Array.from(allIngredientIds);

  // ── BƯỚC 3: Tìm các recipe có chứa ít nhất 1 nguyên liệu khớp ────────
  const { data: matchingData } = await supabase
    .from('recipe_ingredients')
    .select('recipe_id')
    .in('ingredient_id', ingredientIds);

  if (!matchingData || matchingData.length === 0) return [];

  // Đếm số nguyên liệu khớp cho mỗi recipe
  const matchedCount: Record<string, number> = {};
  matchingData.forEach(m => {
    matchedCount[m.recipe_id] = (matchedCount[m.recipe_id] || 0) + 1;
  });
  const matchedRecipeIds = Object.keys(matchedCount);

  // ── BƯỚC 4: Lấy tổng nguyên liệu CHÍNH (is_main=true) ────────────────
  const { data: totalData } = await supabase
    .from('recipe_ingredients')
    .select('recipe_id')
    .in('recipe_id', matchedRecipeIds)
    .eq('is_main', true);

  const totalMainCount: Record<string, number> = {};
  totalData?.forEach(r => {
    totalMainCount[r.recipe_id] = (totalMainCount[r.recipe_id] || 0) + 1;
  });

  const userTotal = queryIngredients.length;
  const SCORE_THRESHOLD = 0.4;

  const scored = matchedRecipeIds
    .map(id => {
      const matched    = matchedCount[id] ?? 0;
      const total      = totalMainCount[id] ?? matched;
      const matchRatio = matched / Math.max(total, 1);
      const coverage   = matched / Math.max(userTotal, 1);
      const score      = matchRatio * 0.5 + coverage * 0.5;
      return { id, matched, total, score };
    })
    .filter(r => r.score >= SCORE_THRESHOLD)
    .sort((a, b) => b.score - a.score);

  // ── BƯỚC 6: Fetch chi tiết top 20 recipe (Kèm Privacy Filter) ───────
  const topIds = scored.slice(0, 20).map(r => r.id);
  if (topIds.length === 0) return [];

  let query = supabase
    .from('recipes')
    .select('id, name, category, sub_category, cooking_time, calories, image_url, difficulty, is_personal, user_id')
    .in('id', topIds);

  // Privacy Filter: is_personal=false OR user_id = current user
  if (user) {
    query = query.or(`is_personal.eq.false,user_id.eq.${user.id}`);
  } else {
    query = query.eq('is_personal', false);
  }

  const { data: recipesData } = await query;

  if (!recipesData) return [];

  const scoreMap = Object.fromEntries(scored.map(r => [r.id, r]));
  return recipesData
    .map(r => {
      const s = scoreMap[r.id];
      return {
        ...r,
        match_count: s?.matched ?? 0,
      } as RecipeSearchResult;
    })
    .sort((a, b) => (scoreMap[b.id]?.score || 0) - (scoreMap[a.id]?.score || 0));
}

export async function getRecipeDetail(id: string) {
  const supabase = await createClient();
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

  if (error) return null;
  return data;
}

export async function getPersonalRecipes(): Promise<RecipeSearchResult[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data, error } = await supabase
    .from('recipes')
    .select('id, name, category, sub_category, cooking_time, calories, image_url, created_at, difficulty, is_personal, user_id')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return [];
  return data as RecipeSearchResult[];
}

export async function createRecipe(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  try {
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const cookingTime = parseInt(formData.get('cookingTime') as string);
    const difficulty = formData.get('difficulty') as string;
    const servings = parseInt(formData.get('servings') as string);
    const ingredientsJson = formData.get('ingredients') as string;
    const stepsJson = formData.get('steps') as string;
    const imageFile = formData.get('image') as File;

    const ingredients = JSON.parse(ingredientsJson);
    const steps = JSON.parse(stepsJson);

    let imageUrl = '';
    if (imageFile && imageFile.size > 0) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('recipe-images')
        .upload(fileName, imageFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('recipe-images')
        .getPublicUrl(uploadData.path);

      imageUrl = publicUrl;
    }

    const newRecipeId = `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    const { data: recipe, error: recipeError } = await supabase
      .from('recipes')
      .insert({
        id: newRecipeId,
        name,
        description,
        cooking_time: cookingTime,
        difficulty,
        servings,
        steps,
        image_url: imageUrl,
        is_personal: true,
        category: 'user-contributed',
        user_id: user.id
      })
      .select()
      .single();

    if (recipeError) throw recipeError;

    for (const ing of ingredients) {
      const { data: ingData, error: ingError } = await supabase
        .from('ingredients')
        .upsert({ name: ing.name.toLowerCase().trim() }, { onConflict: 'name' })
        .select()
        .single();

      if (ingError) continue;

      await supabase.from('recipe_ingredients').insert({
        recipe_id: recipe.id,
        ingredient_id: ingData.id,
        amount: ing.amount,
        is_main: true
      });
    }

    return { success: true, id: recipe.id };
  } catch (error: any) {
    return { success: false, error: error.message || String(error) };
  }
}

export async function getRecipesByIds(ids: string[]): Promise<RecipeSearchResult[]> {
  if (!ids || ids.length === 0) return [];
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let query = supabase
    .from('recipes')
    .select('id, name, category, sub_category, cooking_time, calories, image_url, difficulty, is_personal, user_id')
    .in('id', ids);

  if (user) {
    query = query.or(`is_personal.eq.false,user_id.eq.${user.id}`);
  } else {
    query = query.eq('is_personal', false);
  }

  const { data, error } = await query;
  if (error || !data) return [];
  return data as RecipeSearchResult[];
}

export async function getInspiredRecipes(inspirationType: string): Promise<RecipeSearchResult[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let query = supabase
    .from('recipes')
    .select('id, name, category, sub_category, cooking_time, calories, image_url, difficulty, is_personal, user_id');

  // Privacy Filter
  if (user) {
    query = query.or(`is_personal.eq.false,user_id.eq.${user.id}`);
  } else {
    query = query.eq('is_personal', false);
  }

  switch (inspirationType) {
    case 'quick':
      query = query.lte('cooking_time', 15);
      break;
    case 'party':
      query = query.or('category.in.(an-vat,khai-vi),sub_category.in.(nuong,chien)');
      break;
    case 'healthy':
      // Include specific categories or low-calorie dishes
      query = query.or('category.in.(salad-goi,an-chay,healthy),calories.lt.400');
      break;
    case 'breakfast':
      // Include all common breakfast categories
      query = query.in('category', ['an-sang', 'pho-bun', 'mi-bun', 'xoi-com-chien', 'banh-da-mien', 'breakfast']);
      break;
    case 'snack':
      // Include snacks, desserts and treats
      query = query.or('category.in.(an-vat,trang-mieng-che,trang-mieng,snack),sub_category.in.(trang-mieng,an-vat)');
      break;
    default:
      return [];
  }
  
  const { data, error } = await query.limit(30);
  if (error || !data) return [];
  return data.sort(() => 0.5 - Math.random()) as RecipeSearchResult[];
}

export async function updateRecipe(id: string, formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  try {
    // Check ownership first
    const { data: existing } = await supabase
      .from('recipes')
      .select('user_id')
      .eq('id', id)
      .single();

    if (!existing || existing.user_id !== user.id) {
      return { success: false, error: 'Permission denied' };
    }

    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const cookingTime = parseInt(formData.get('cookingTime') as string);
    const difficulty = formData.get('difficulty') as string;
    const servings = parseInt(formData.get('servings') as string);
    const ingredientsJson = formData.get('ingredients') as string;
    const stepsJson = formData.get('steps') as string;
    const imageFile = formData.get('image') as File;

    const ingredients = JSON.parse(ingredientsJson);
    const steps = JSON.parse(stepsJson);

    let imageUrl = formData.get('existingImageUrl') as string;

    if (imageFile && imageFile.size > 0) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('recipe-images')
        .upload(fileName, imageFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('recipe-images')
        .getPublicUrl(uploadData.path);

      imageUrl = publicUrl;
    }

    const { error: recipeError } = await supabase
      .from('recipes')
      .update({
        name,
        description,
        cooking_time: cookingTime,
        difficulty,
        servings,
        steps,
        image_url: imageUrl,
      })
      .eq('id', id);

    if (recipeError) throw recipeError;

    // To simplify ingredients update, delete old and insert new
    await supabase.from('recipe_ingredients').delete().eq('recipe_id', id);

    for (const ing of ingredients) {
      const { data: ingData, error: ingError } = await supabase
        .from('ingredients')
        .upsert({ name: ing.name.toLowerCase().trim() }, { onConflict: 'name' })
        .select()
        .single();

      if (ingError) continue;

      await supabase.from('recipe_ingredients').insert({
        recipe_id: id,
        ingredient_id: ingData.id,
        amount: ing.amount,
        is_main: true
      });
    }

    return { success: true, id };
  } catch (error: any) {
    return { success: false, error: error.message || String(error) };
  }
}

