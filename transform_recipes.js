// transform_recipes.js
const fs = require('fs');

// Read the user-provided JSON data
const rawData = fs.readFileSync('user_recipes.json', 'utf-8');
const recipes = JSON.parse(rawData);

// Database schema mapping
const transformed = recipes.map(r => {
  // Determine category based on the ID prefix
  // basa-xxx -> ca (fish)
  // diep-hong-xxx -> ca (fish)
  // tre-xxx -> ca (fish)
  // thu-xxx -> ca (fish)
  // ngu-xxx -> ca (fish)
  // nuc-xxx -> ca (fish)
  // hoi-xxx -> ca (fish)
  // chim-xxx -> ca (fish)
  // com-xxx -> ca (fish)
  const idPrefix = r.id.split('-')[0];
  let category = 'ca';
  
  // Determine sub_category based on difficulty/tags
  let subCategory = '';
  if (r.tags && r.tags.includes('braised')) subCategory = 'kho';
  else if (r.tags && r.tags.includes('fried')) subCategory = 'chien';
  else if (r.tags && r.tags.includes('steamed')) subCategory = 'hap';
  else if (r.tags && r.tags.includes('hotpot')) subCategory = 'lau';
  else if (r.tags && r.tags.includes('porridge')) subCategory = 'chau';
  else if (r.tags && r.tags.includes('salad')) subCategory = 'goi';
  else if (r.tags && r.tags.includes('sour-soup')) subCategory = 'canh-chua';
  else subCategory = 'kho'; // default

  // Flatten ingredients for the junction table logic (handled by app logic or simple array for now)
  // For the database, we just store the stringified object or handle mapping in app
  // But setup.sql expects recipe_ingredients junction table. 
  // Since I don't have ingredient IDs, I will store ingredients as JSON string in a temporary column
  // or just map the IDs. 
  // Wait, I should check if I can generate ingredient IDs.
  // For simplicity, let's extract ingredients and map them to IDs in a separate step or 
  // just store the raw data in a JSON column if the DB allows (Postgres supports JSONB).
  // But setup.sql schema doesn't have a JSON column for ingredients in 'recipes' table explicitly, 
  // it relies on 'recipe_ingredients' junction.
  // I will assume the app handles the junction table or I'll just populate the 'recipes' table 
  // with what fits and maybe skip ingredients for now if they are complex to map without IDs.
  // Actually, I can just extract all unique ingredient names to create an ingredients list first.

  return {
    id: r.id,
    name: r.name,
    category: category,
    sub_category: subCategory,
    steps: r.steps, // Array of strings
    cooking_time: r.time,
    difficulty: r.difficulty,
    servings: 4, // Default
    region: r.region,
    calories: r.calories,
    tips: r.tips,
    image_url: `/images/${r.id}.jpg`,
    description: r.description,
    // We will store ingredients as a JSON string here if we can't map them to DB IDs right away
    // But wait, I should create the ingredients mapping first.
    ingredients_data: JSON.stringify(r.ingredients) 
  };
});

// Extract all unique ingredients to build the ingredients table
const allIngredients = new Set();
recipes.forEach(r => {
  if (r.ingredients) {
    if (r.ingredients.main) r.ingredients.main.forEach(i => allIngredients.add(i));
    if (r.ingredients.optional) r.ingredients.optional.forEach(i => allIngredients.add(i));
  }
});

const ingredientList = Array.from(allIngredients).map((name, index) => ({
  id: `ing-${index + 1}`,
  name: name
}));

console.log(`Transformed ${transformed.length} recipes.`);
console.log(`Found ${ingredientList.length} unique ingredients.`);

// Write output
fs.writeFileSync('transformed_recipes.json', JSON.stringify(transformed, null, 2));
fs.writeFileSync('transformed_ingredients.json', JSON.stringify(ingredientList, null, 2));

console.log('Files created: transformed_recipes.json, transformed_ingredients.json');
