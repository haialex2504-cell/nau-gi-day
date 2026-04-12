import { supabase } from './src/lib/supabase';

async function searchRecipes(queryIngredients: string[]) {
  console.log(`\n\n--- Tìm kiếm với: [${queryIngredients.join(', ')}] ---`);
  
  if (!queryIngredients || queryIngredients.length === 0) return [];
  const normalizedQuery = queryIngredients.map(i => i.toLowerCase().trim());

  const { data: ingredientsData, error: ingError } = await supabase
    .from('ingredients')
    .select('id, name')
    .in('name', normalizedQuery);

  if (ingError || !ingredientsData || ingredientsData.length === 0) {
    console.error('Không tìm thấy ID nguyên liệu:', ingError);
    return [];
  }
  
  console.log('Các nguyên liệu tìm thấy trong DB:', ingredientsData.map(i => i.name).join(', '));

  const ingredientIds = ingredientsData.map(i => i.id);

  const { data: matchingData, error: matchError } = await supabase
    .from('recipe_ingredients')
    .select('recipe_id')
    .in('ingredient_id', ingredientIds);

  if (matchError || !matchingData || matchingData.length === 0) {
    console.error('Không tìm thấy món nào khớp.', matchError);
    return [];
  }

  const matchCounts: Record<string, number> = {};
  matchingData.forEach(m => {
    matchCounts[m.recipe_id] = (matchCounts[m.recipe_id] || 0) + 1;
  });

  const threshold = queryIngredients.length >= 2 ? 2 : 1;
  const filteredRecipeIds = Object.keys(matchCounts).filter(id => matchCounts[id] >= threshold);
  const sortedRecipeIds = filteredRecipeIds.sort((a, b) => matchCounts[b] - matchCounts[a]);

  const topIds = sortedRecipeIds.slice(0, 10);
  
  if (topIds.length === 0) {
    console.log('Không có công thức nào đạt đủ match count (threshold = ' + threshold + ')');
    return [];
  }

  const { data: recipesData, error: recipeError } = await supabase
    .from('recipes')
    .select('id, name')
    .in('id', topIds);

  if (recipeError || !recipesData) {
    console.error('Lỗi khi lấy thông tin recipes:', recipeError);
    return [];
  }

  const results = topIds.map(id => {
    const r = recipesData.find(recipe => recipe.id === id);
    return { name: r?.name, match_count: matchCounts[id] };
  });

  console.table(results);
}

async function run() {
  await searchRecipes(['trứng gà']);
  await searchRecipes(['trứng gà', 'thịt heo ba chỉ']);
  await searchRecipes(['trứng gà', 'thịt heo ba chỉ', 'đậu phộng']);
}

run();
