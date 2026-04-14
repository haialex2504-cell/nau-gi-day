const fs = require('fs');
const path = require('path');

const files = ['src/lib/recipes_data.json', 'new_recipes.json', 'setup.sql'];
const cjkRegex = /[\u3040-\u30ff\uac00-\ud7af\u4e00-\u9fff]/;

files.forEach(filePath => {
    if (!fs.existsSync(filePath)) return;
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');

    console.log(`Checking ${filePath}...`);
    lines.forEach((line, index) => {
        if (cjkRegex.test(line)) {
            console.log(`  Line ${index + 1}: ${line.trim()}`);
        }
    });
});
