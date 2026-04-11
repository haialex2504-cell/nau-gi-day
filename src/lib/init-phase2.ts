import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function init() {
  console.log("🛠️ Starting Phase 2 Initialization...");

  // 1. Update Database Columns
  console.log("📝 Updating database schema...");
  const { error: dbError } = await supabase.rpc('execute_sql', {
    sql_query: `
      ALTER TABLE recipes ADD COLUMN IF NOT EXISTS description TEXT;
      ALTER TABLE recipes ADD COLUMN IF NOT EXISTS is_personal BOOLEAN DEFAULT FALSE;
      CREATE INDEX IF NOT EXISTS idx_recipes_is_personal ON recipes(is_personal);
    `
  });

  // Note: execute_sql might not be enabled by default in all projects. 
  // If it fails, I'll advise the user to run it in the dashboard.
  if (dbError) {
    console.warn("⚠️ Could not execute SQL via RPC. Please ensure 'is_personal' and 'description' columns exist in 'recipes' table.");
    console.error(dbError.message);
  } else {
    console.log("✅ Database columns updated.");
  }

  // 2. Create Storage Bucket
  console.log("📦 Creating storage bucket 'recipe-images'...");
  const { data: bucket, error: bucketError } = await supabase.storage.createBucket('recipe-images', {
    public: true,
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp'],
    fileSizeLimit: 5242880 // 5MB
  });

  if (bucketError) {
    if (bucketError.message.includes('already exists')) {
      console.log("ℹ️ Bucket 'recipe-images' already exists.");
    } else {
      console.error("❌ Error creating bucket:", bucketError.message);
    }
  } else {
    console.log("✅ Bucket 'recipe-images' created.");
  }

  console.log("✨ Phase 2 Initialization complete!");
}

init();
