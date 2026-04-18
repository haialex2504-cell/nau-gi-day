'use server';

import { adminDb } from '@/utils/firebase/admin';
import { getSessionUser } from './firebase-auth';
import { resolveIngredients } from '@/lib/synonyms';
import { createClient } from '@supabase/supabase-js';

// Cấu hình Supabase Admin (Bỏ qua RLS để upload ảnh vì lúc này ta dùng Firebase Auth)
const supabaseAdmin = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY 
  ? createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY) 
  : null;

export interface RecipeSearchResult {
  id: string;
  name: string;
  description?: string;
  category: string;
  sub_category: string;
  cooking_time: number;
  calories: number;
  image_url: string;
  difficulty?: string;
  servings?: number;
  is_personal?: boolean;
  match_count?: number;
  score?: number;
  created_at?: string;
  user_id?: string;
  ingredients?: any[];
  tags?: string[];
  steps?: string[];
}

let cachedRecipes: RecipeSearchResult[] | null = null;
let cacheTimestamp = 0;
const CACHE_TTL = 1000 * 60 * 30; // 30 mins

// Helper: Tải toàn bộ Data vào RAM
export async function getAllRecipesCached(): Promise<RecipeSearchResult[]> {
  if (cachedRecipes && (Date.now() - cacheTimestamp < CACHE_TTL)) {
    return cachedRecipes;
  }
  
  // Nạp từ Firestore
  const snap = await adminDb().collection('recipes').get();
  cachedRecipes = snap.docs.map(doc => doc.data() as RecipeSearchResult);
  cacheTimestamp = Date.now();
  
  return cachedRecipes;
}

import { revalidatePath } from 'next/cache';

// Xóa cache (Dùng sau khi tạo/sửa món)
export async function invalidateCache() {
  cachedRecipes = null;
  cacheTimestamp = 0;
  // Xóa client-side Router Cache của Next.js
  revalidatePath('/', 'layout');
}

// 1. Tìm kiếm (Bằng RAM cache)
export async function searchRecipes(queryIngredients: string[]): Promise<RecipeSearchResult[]> {
  if (!queryIngredients || queryIngredients.length === 0) return [];
  
  // Bước 1: Resolve đồng nghĩa 
  const resolvedTerms = resolveIngredients(queryIngredients).map(t => t.toLowerCase().trim());
  const userTotal = queryIngredients.length;
  const SCORE_THRESHOLD = 0.4;

  // Bước 2: Lọc công thức cá nhân (Chỉ xem của mình, hoặc của public)
  const user = await getSessionUser();
  const allRecipes = await getAllRecipesCached();

  const validRecipes = allRecipes.filter(r => {
    if (r.is_personal) {
      return user && r.user_id === user.uid;
    }
    return true;
  });

  // Bước 3: Thuật toán dò nguyên liệu + Tính điểm
  const scored = validRecipes.map(r => {
    let matched = 0;
    let totalMain = 0;

    if (r.ingredients) {
      r.ingredients.forEach(ing => {
        if (ing.is_main) totalMain++;
        const ingName = (ing.name || '').toLowerCase();
        
        // Match string trực diện (Nhanh và hiệu quả bằng NoSQL)
        if (resolvedTerms.some(term => ingName.includes(term))) {
          matched++;
        }
      });
    }

    const total = totalMain || matched || 1;
    const matchRatio = matched / total;
    const coverage = matched / Math.max(userTotal, 1);
    const score = matchRatio * 0.5 + coverage * 0.5;

    return { ...r, match_count: matched, score };
  })
  .filter(r => r.score >= SCORE_THRESHOLD)
  .sort((a, b) => b.score - a.score);

  // Trả về top 20
  return scored.slice(0, 20);
}


// 2. Chi tiết công thức
export async function getRecipeDetail(id: string) {
  const doc = await adminDb().collection('recipes').doc(id).get();
  if (!doc.exists) return null;
  return doc.data();
}


// 3. Công thức cá nhân (My Recipes)
export async function getPersonalRecipes(): Promise<RecipeSearchResult[]> {
  const user = await getSessionUser();
  if (!user) return [];

  const allRecipes = await getAllRecipesCached();
  
  return allRecipes
    .filter(r => r.user_id === user.uid)
    .sort((a, b) => {
       const timeA = new Date(a.created_at || 0).getTime();
       const timeB = new Date(b.created_at || 0).getTime();
       return timeB - timeA;
    });
}

// 4. Tìm nhều id (Cho trang Favorites)
export async function getRecipesByIds(ids: string[]): Promise<RecipeSearchResult[]> {
  if (!ids || ids.length === 0) return [];
  const user = await getSessionUser();
  
  // Dùng cache lấy cho nhanh, tránh limit 'in' của Firestore (Tối đa 30)
  const allRecipes = await getAllRecipesCached();
  
  const matches = allRecipes.filter(r => ids.includes(r.id));
  
  // Privacy Filter
  return matches.filter(r => {
    if (r.is_personal) return user && r.user_id === user.uid;
    return true;
  });
}

// 5. Tìm cảm hứng
export async function getInspiredRecipes(inspirationType: string): Promise<RecipeSearchResult[]> {
  const user = await getSessionUser();
  const allRecipes = await getAllRecipesCached();

  const validRecipes = allRecipes.filter(r => {
    if (r.is_personal) return user && r.user_id === user.uid;
    return true;
  });

  let pool = [];
  switch (inspirationType) {
    case 'quick':
      pool = validRecipes.filter(r => r.cooking_time <= 15);
      break;
    case 'party':
      pool = validRecipes.filter(r => 
        ['an-vat','khai-vi'].includes(r.category) || ['nuong','chien'].includes(r.sub_category)
      );
      break;
    case 'healthy':
      pool = validRecipes.filter(r => 
        ['salad-goi','an-chay','healthy'].includes(r.category) || r.calories < 400
      );
      break;
    case 'breakfast':
      pool = validRecipes.filter(r => 
        ['an-sang', 'pho-bun', 'mi-bun', 'xoi-com-chien', 'banh-da-mien', 'breakfast'].includes(r.category)
      );
      break;
    case 'snack':
      pool = validRecipes.filter(r => 
        ['an-vat','trang-mieng-che','trang-mieng','snack'].includes(r.category) || 
        ['trang-mieng','an-vat'].includes(r.sub_category)
      );
      break;
    default:
      return [];
  }
  
  // Xáo trộn và lấy ngẫu nhiên 30
  return pool.sort(() => 0.5 - Math.random()).slice(0, 30);
}


export async function createRecipe(formData: FormData) {
  const user = await getSessionUser();
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

    const ingredients = JSON.parse(ingredientsJson).map((ing: any) => ({
      name: ing.name.toLowerCase().trim(),
      amount: ing.amount,
      is_main: true
    }));
    const steps = JSON.parse(stepsJson);

    let imageUrl = ''; 
    // Dùng Supabase Admin Storage để upload ảnh
    if (imageFile && imageFile.size > 0 && supabaseAdmin) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${user.uid}/${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from('recipe-images')
        .upload(fileName, imageFile, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabaseAdmin.storage
        .from('recipe-images')
        .getPublicUrl(uploadData.path);
        
      imageUrl = publicUrl;
    }
    
    // Logic lưu vào Firestore
    const newRecipeId = `usr-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    const newRecipe = {
      id: newRecipeId,
      name,
      description,
      cooking_time: cookingTime,
      difficulty,
      servings,
      steps,
      ingredients,
      image_url: imageUrl,
      is_personal: true,
      category: 'user-contributed',
      user_id: user.uid,
      created_at: new Date().toISOString()
    };

    await adminDb().collection('recipes').doc(newRecipeId).set(newRecipe);
    await invalidateCache();

    return { success: true, id: newRecipeId };
  } catch (error: any) {
    return { success: false, error: error.message || String(error) };
  }
}

export async function updateRecipe(id: string, formData: FormData) {
  const user = await getSessionUser();
  if (!user) return { success: false, error: 'Unauthorized' };

  try {
    const doc = await adminDb().collection('recipes').doc(id).get();
    if (!doc.exists) return { success: false, error: 'Not found' };
    
    const existing = doc.data();
    if (existing?.user_id !== user.uid) {
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

    const ingredients = JSON.parse(ingredientsJson).map((ing: any) => ({
      name: ing.name.toLowerCase().trim(),
      amount: ing.amount,
      is_main: true
    }));
    const steps = JSON.parse(stepsJson);

    let imageUrl = formData.get('existingImageUrl') as string;
    
    // Upload ảnh mới lên Supabase nếu có
    if (imageFile && imageFile.size > 0 && supabaseAdmin) {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${user.uid}/${Date.now()}.${fileExt}`;
      
      const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
        .from('recipe-images')
        .upload(fileName, imageFile, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabaseAdmin.storage
        .from('recipe-images')
        .getPublicUrl(uploadData.path);
        
      imageUrl = publicUrl;
    }

    await adminDb().collection('recipes').doc(id).update({
      name,
      description,
      cooking_time: cookingTime,
      difficulty,
      servings,
      steps,
      ingredients,
      image_url: imageUrl,
    });
    await invalidateCache();

    return { success: true, id };
  } catch (error: any) {
    return { success: false, error: error.message || String(error) };
  }
}
