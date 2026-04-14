const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env.local");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function exportSample() {
  console.log("Fetching 10 recipes from Supabase...");
  const { data, error } = await supabase
    .from('recipes')
    .select('id, name, category')
    .limit(10);
    
  if (error) {
    console.error("Error fetching data:", error);
    process.exit(1);
  }
  
  if (!data || data.length === 0) {
    console.log("No recipes found in the database.");
    process.exit(0);
  }
  
  const csvLines = ['id,name,category'];
  data.forEach(r => {
    // Escape quotes to prevent CSV breaking
    const cleanId = r.id;
    const cleanName = (r.name || '').replace(/"/g, '""');
    const cleanCategory = (r.category || '').replace(/"/g, '""');
    csvLines.push(`"${cleanId}","${cleanName}","${cleanCategory}"`);
  });
  
  const csvContent = csvLines.join('\n');
  
  fs.writeFileSync('canva_sample_10.csv', '\ufeff' + csvContent, 'utf8'); // Add BOM for excel/canva utf-8 support
  console.log(`Successfully exported ${data.length} recipes to canva_sample_10.csv`);
}

exportSample();
