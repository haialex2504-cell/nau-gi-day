import { createClient } from '@supabase/supabase-js';
import admin from 'firebase-admin';
import dotenv from 'dotenv';
import { readFileSync } from 'fs';

// 1. Tải Biến môi trường
const envContent = readFileSync('.env.local', 'utf8');
const env = dotenv.parse(envContent);

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY; // Phải dùng Service Key để lấy thông tin Auth

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Thiếu thông tin kết nối Supabase Service Role trong .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

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

async function migrateFavorites() {
  console.log('🚀 Bắt đầu quá trình Di chuyển dữ liệu Favorites (Supabase -> Firestore)...');

  try {
    // 1. Lấy danh sách tài khoản từ Supabase để ánh xạ UUID -> Email
    console.log('1️⃣ Đang lấy dữ liệu users từ Supabase...');
    const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
    if (usersError) throw usersError;
    
    // Tạo từ điển UUID -> Email
    const userMap = new Map();
    users.forEach(u => userMap.set(u.id, u.email));
    console.log(`✅ Tìm thấy ${users.length} tài khoản trên Supabase.`);

    // 2. Lấy dữ liệu user_favorites từ Supabase
    console.log('2️⃣ Đang lấy dữ liệu user_favorites từ Supabase...');
    const { data: favorites, error: favError } = await supabase.from('user_favorites').select('*');
    if (favError) throw favError;
    console.log(`✅ Tìm thấy ${favorites.length} lượt yêu thích.`);

    if (favorites.length === 0) {
      console.log('✨ Không có món nào được thả tim, hoàn thành migration!');
      return;
    }

    let successCount = 0;
    let missingUserCount = 0;

    console.log('3️⃣ Đang ghi dữ liệu vào Firebase Firestore...');
    const batch = db.batch(); // Firebase giới hạn max 500 ops/batch. Dữ liệu favs ít nên ta dùng 1 batch.

    for (const fav of favorites) {
      const email = userMap.get(fav.user_id);
      if (!email) continue;

      try {
        // Tìm User bên Firebase bằng Email
        const firebaseUser = await admin.auth().getUserByEmail(email);
        
        // Tạo Record trong Sub-collection "users/{uid}/favorites/{recipeId}"
        const favRef = db.collection('users').doc(firebaseUser.uid).collection('favorites').doc(fav.recipe_id);
        
        batch.set(favRef, {
          created_at: fav.created_at,
          migrated_from_supabase: true
        }, { merge: true }); // Merge để không ghi đè nếu đã tốn tại
        
        successCount++;
      } catch (err) {
        if (err.code === 'auth/user-not-found') {
          // Bỏ qua nếu user chưa đăng ký bên Firebase
          missingUserCount++;
        } else {
          console.error(`❌ Lỗi ánh xạ cho user ${email}:`, err.message);
        }
      }
    }

    if (successCount > 0) {
      await batch.commit();
      console.log(`🎉 CHUYỂN DỮ LIỆU THÀNH CÔNG! Đã chuyển ${successCount} món yêu thích vào Firestore.`);
    } else {
      console.log(`⚠️ Không có dữ liệu nào được chuyển.`);
    }

    if (missingUserCount > 0) {
      console.log(`💡 BỎ QUA ${missingUserCount} lượt thả tim vì người dùng chưa tạo tài khoản bên hệ thống Firebase mới.`);
    }

  } catch (err) {
    console.error('❌ Lỗi tổng quát trong quá trình di chuyển:', err);
  }
}

migrateFavorites();
