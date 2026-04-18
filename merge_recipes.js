const fs = require('fs');
const path = require('path');

const mainFile = path.join(__dirname, 'src/lib/recipes_data.json');
const targetFile = process.argv[2] || 'new_recipes.json';
const newFile = path.join(__dirname, targetFile);

const mainData = JSON.parse(fs.readFileSync(mainFile, 'utf8'));
const newData = JSON.parse(fs.readFileSync(newFile, 'utf8'));

const existingIds = new Set(mainData.map(r => r.id));
const existingNames = new Set(mainData.map(r => r.name.toLowerCase()));

let addedCount = 0;
let skipped = [];

for (const recipe of newData) {
  if (!existingIds.has(recipe.id) && !existingNames.has(recipe.name.toLowerCase())) {
    mainData.push(recipe);
    addedCount++;
  } else {
    skipped.push(recipe.name);
  }
}

if (skipped.length > 0) {
  console.log(`Skipped ${skipped.length} recipes due to duplicate IDs or Names: \n - ${skipped.join('\n - ')}`);
}

fs.writeFileSync(mainFile, JSON.stringify(mainData, null, 0).replace(/},/g, '},\n'));
console.log(`Successfully merged. Added ${addedCount} new recipes.`);
