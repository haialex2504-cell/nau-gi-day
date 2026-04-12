require('dotenv').config({ path: '.env.local' });

const { searchRecipes } = require('../src/app/actions/recipe');
const { resolveIngredients } = require('../src/lib/synonyms');

async function debugSearch() {
  const inputs = ['Trứng', 'Thịt lợn', 'mộc nhĩ'];
  console.log('--- DEBUG START ---');
  console.log('Searching for:', inputs);

  const resolved = resolveIngredients(inputs);
  console.log('Resolved Ingredients:', resolved);

  try {
    const results = await searchRecipes(inputs);
    console.log('Results Count:', results.length);
    results.forEach((r, i) => {
      console.log(`${i+1}. ${r.name} (Score: ${r.score}, Matched: ${r.match_count})`);
      if (r.name.includes('Nem rán Hà Nội')) {
          console.log('   >>> SUCCESS: Found target recipe!');
      }
    });
  } catch (err) {
    console.error('Error during search:', err);
  }
  console.log('--- DEBUG END ---');
}

debugSearch();
