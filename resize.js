const Jimp = require('jimp');

async function resizeImages() {
  const imgPath = 'C:\\Users\\Hai\\.gemini\\antigravity\\brain\\c4c55554-8ef0-42d0-afb0-0258339ee6e8\\media__1776135306206.jpg';
  
  try {
    const img = await Jimp.read(imgPath);
    
    await img.clone().resize(512, 512).writeAsync('public/icon-512.png');
    console.log('Created icon-512.png');
    
    await img.clone().resize(192, 192).writeAsync('public/icon-192.png');
    console.log('Created icon-192.png');
    
    await img.clone().resize(180, 180).writeAsync('public/apple-icon.png');
    console.log('Created apple-icon.png');
    
    await img.clone().resize(32, 32).writeAsync('src/app/icon.png');
    console.log('Created favicon 32x32');
    
    console.log('All icons resized successfully!');
  } catch (error) {
    console.error('Error resizing images:', error);
  }
}

resizeImages();
