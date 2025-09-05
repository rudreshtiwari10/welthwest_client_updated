#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const publicImagesDir = path.join(__dirname, '..', 'public', 'images');

// Check if critical optimized images exist
const criticalImages = [
  'ai-analysis-poster.avif',
  'ai-analysis-poster.webp', 
  'welthai-chat-poster.avif',
  'welthai-chat-poster.webp',
  'backtesting-poster.avif',
  'backtesting-poster.webp',
  'singlelogo.avif',
  'singlelogo.webp',
  'logo.avif',
  'logo.webp'
];

console.log('🔍 Checking for optimized images...');

const missingImages = criticalImages.filter(img => {
  const fullPath = path.join(publicImagesDir, img);
  return !fs.existsSync(fullPath);
});

if (missingImages.length > 0) {
  console.log('⚠️ Missing optimized images:');
  missingImages.forEach(img => console.log(`  - ${img}`));
  console.log('');
  console.log('📝 To generate these images locally, run:');
  console.log('  npm install --include=dev');
  console.log('  npm run optimize:images');
  console.log('');
  console.log('🚀 For now, continuing with available images...');
} else {
  console.log('✅ All critical optimized images found!');
}

// Create a simple fallback for missing images
const fallbackConfig = {
  'ai-analysis-poster.avif': 'ai-analysis-poster.JPG',
  'ai-analysis-poster.webp': 'ai-analysis-poster.JPG',
  'welthai-chat-poster.avif': 'welthai-chat-poster.JPG',
  'welthai-chat-poster.webp': 'welthai-chat-poster.JPG',
  'backtesting-poster.avif': 'backtesting-poster.jpg',
  'backtesting-poster.webp': 'backtesting-poster.jpg',
  'singlelogo.avif': 'singlelogo.png',
  'singlelogo.webp': 'singlelogo.png',
  'logo.avif': 'logo.png',
  'logo.webp': 'logo.png'
};

// Create a runtime config for image loading
const imageConfig = {
  optimizedAvailable: missingImages.length === 0,
  fallbacks: fallbackConfig,
  criticalImages: criticalImages
};

const configPath = path.join(__dirname, '..', 'src', 'config', 'imageConfig.json');
fs.writeFileSync(configPath, JSON.stringify(imageConfig, null, 2));

console.log(`📄 Image configuration written to: ${configPath}`);
console.log('✅ Deployment preparation complete!');