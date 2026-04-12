import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { searchRecipes } from '../src/app/actions/recipe';
import { resolveIngredients } from '../src/lib/synonyms';

async function debugSearch() {
  const inputs = ['Trứng', 'Thịt lợn', 'mộc nhĩ'];
  console.log('--- DEBUG START ---');
  console.log('Searching for:', inputs);

  const resolved = resolveIngredients(inputs);
  console.log('Resolved Ingredients:', resolved);

  const results = await searchRecipes(inputs);
  console.log('Results Count:', results.length);
  results.forEach((r, i) => {
    console.log(`${i+1}. ${r.name} (Score: ${r.score}, Matched: ${r.match_count})`);
  });
  console.log('--- DEBUG END ---');
}

debugSearch().catch(console.error);
