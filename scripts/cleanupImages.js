const fs = require('fs');
const path = require('path');

const imagesDir = path.join(__dirname, '..', 'public', 'images');

console.log('🧹 Cleaning up duplicate optimized images...');

// Get all files in the images directory
const files = fs.readdirSync(imagesDir);

// Find files that have been over-optimized (multiple suffixes)
const duplicatePatterns = [
  /-optimized.*-optimized/,  // Double optimized
  /@2x.*@2x/,               // Double @2x
  /-lg.*-lg/,               // Double -lg
  /-md.*-md/,               // Double -md
  /-sm.*-sm/,               // Double -sm
  /-optimized.*-lg/,        // Mixed suffixes
  /-optimized.*-md/,
  /-optimized.*-sm/,
  /-optimized.*@2x/,
  /@2x.*-optimized/,
  /-lg.*-optimized/,
  /-md.*-optimized/,
  /-sm.*-optimized/
];

const filesToDelete = files.filter(file => {
  return duplicatePatterns.some(pattern => pattern.test(file));
});

if (filesToDelete.length === 0) {
  console.log('✅ No duplicate files found!');
  return;
}

console.log(`Found ${filesToDelete.length} duplicate files to remove:`);
filesToDelete.forEach(file => console.log(`  - ${file}`));

// Delete the duplicate files
let deletedCount = 0;
filesToDelete.forEach(file => {
  try {
    const filePath = path.join(imagesDir, file);
    fs.unlinkSync(filePath);
    deletedCount++;
  } catch (error) {
    console.error(`❌ Failed to delete ${file}:`, error.message);
  }
});

console.log(`✅ Successfully deleted ${deletedCount} duplicate files!`);
console.log('🎉 Image cleanup complete!');