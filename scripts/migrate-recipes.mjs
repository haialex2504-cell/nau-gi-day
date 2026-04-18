import { createClient } from '@supabase/supabase-js';
import admin from 'firebase-admin';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';

// 1. Tải Biến môi trường
const envContent = readFileSync('.env.local', 'utf8');
const env = dotenv.parse(envContent);

// 2. Khởi tạo Supabase Client
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Thiếu thông tin kết nối Supabase trong .env.local");
  process.exit(1);
}
const supabase = createClient(supabaseUrl, supabaseKey);

// 3. Khởi tạo Firebase Admin
const firebaseAdminConfig = {
  projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  clientEmail: env.FIREBASE_CLIENT_EMAIL,
  privateKey: env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(firebaseAdminConfig),
  });
}
const db = admin.firestore();

async function migrateRecipes() {
  console.log('🚀 Bắt đầu quá trình Di chuyển dữ liệu Recipes (Supabase -> Firestore)...');

  try {
    // Bước A: Lấy danh sách Recipes từ Supabase
    console.log('1️⃣ Đang tải dữ liệu từ Supabase...');
    const { data: recipes, error: fetchError } = await supabase
      .from('recipes')
      .select(`
        *,
        recipe_tags (tag),
        recipe_ingredients (
          amount,
          is_main,
          ingredients (name)
        )
      `);

    if (fetchError) throw fetchError;
    console.log(`✅ Đã tải thành công ${recipes.length} công thức!`);

    // Bước B: Chuẩn bị dữ liệu ghi vào Firestore
    console.log('2️⃣ Đang ghi dữ liệu vào Firebase Firestore...');
    let successCount = 0;
    
    // Sử dụng Batch để ghi cho tối ưu (Mỗi batch tối đa 500 operations)
    const BATCH_SIZE = 400;
    for (let i = 0; i < recipes.length; i += BATCH_SIZE) {
      const batch = db.batch();
      const chunk = recipes.slice(i, i + BATCH_SIZE);

      for (const recipe of chunk) {
        const recipeRef = db.collection('recipes').doc(recipe.id);
        
        // Chuẩn hóa Tags
        const tags = (recipe.recipe_tags || []).map((t) => t.tag);
        
        // Chuẩn hóa Ingredients
        const ingredients = (recipe.recipe_ingredients || []).map((ri) => ({
          name: ri.ingredients?.name || '',
          amount: ri.amount || '',
          is_main: ri.is_main || false
        }));

        // Object để lưu lên Firebase
        const firebaseRecipe = {
          id: recipe.id,
          name: recipe.name,
          description: recipe.description || '',
          category: recipe.category || '',
          sub_category: recipe.sub_category || '',
          cooking_time: recipe.cooking_time || 0,
          calories: recipe.calories || 0,
          difficulty: recipe.difficulty || 'Dễ',
          servings: recipe.servings || 4,
          steps: recipe.steps || [],
          image_url: recipe.image_url || '',
          is_personal: recipe.is_personal || false,
          user_id: recipe.user_id || null,
          created_at: recipe.created_at || new Date().toISOString(),
          tags: tags,
          ingredients: ingredients
        };

        batch.set(recipeRef, firebaseRecipe);
        successCount++;
      }

      await batch.commit();
      console.log(`⏳ Đã ghi ${successCount}/${recipes.length} công thức...`);
    }

    console.log('🎉 DI CHUYỂN DỮ LIỆU THÀNH CÔNG!');
    console.log(`👉 ${successCount} công thức nấu ăn đã nằm gọn trong Firestore.`);

  } catch (err) {
    console.error('❌ Lỗi trong quá trình di chuyển:', err);
  }
}

migrateRecipes();
