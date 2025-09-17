const fs = require('fs');
const path = require('path');

// Try to require sharp, but make it optional for deployment
let sharp;
try {
  sharp = require('sharp');
} catch (error) {
  console.log('⚠️ Sharp not available - skipping image optimization');
  console.log('This is normal during deployment. Images should be pre-optimized.');
  process.exit(0);
}

const inputDir = path.join(__dirname, '..', 'public', 'images');
const outputDir = path.join(__dirname, '..', 'public', 'images');

// Image optimization settings
const QUALITY = {
  webp: 80,
  avif: 75,
  jpeg: 85
};

// Responsive image sizes
const SIZES = [
  { suffix: '', width: 1920, height: null }, // Original size
  { suffix: '@2x', width: 1920, height: null }, // Retina
  { suffix: '-lg', width: 1200, height: null },
  { suffix: '-md', width: 800, height: null },
  { suffix: '-sm', width: 600, height: null },
];

async function optimizeImage(inputPath, filename) {
  const name = path.parse(filename).name;
  const ext = path.parse(filename).ext;
  
  console.log(`Optimizing ${filename}...`);
  
  try {
    // Get image metadata
    const image = sharp(inputPath);
    const metadata = await image.metadata();
    
    // Generate different sizes and formats
    for (const size of SIZES) {
      const outputName = `${name}${size.suffix}`;
      
      // Calculate dimensions maintaining aspect ratio
      let width = size.width;
      let height = size.height;
      
      if (!height && metadata.height && metadata.width) {
        height = Math.round((metadata.height * width) / metadata.width);
      }
      
      // Create base sharp instance for this size
      const resized = image.resize(width, height, {
        fit: 'cover',
        position: 'center'
      });
      
      // Generate AVIF (best compression)
      await resized
        .avif({ quality: QUALITY.avif })
        .toFile(path.join(outputDir, `${outputName}.avif`));
      
      // Generate WebP (good compression, wide support)
      await resized
        .webp({ quality: QUALITY.webp })
        .toFile(path.join(outputDir, `${outputName}.webp`));
      
      // Generate optimized JPEG as fallback (with different name to avoid conflicts)
      if (ext.toLowerCase() === '.jpg' || ext.toLowerCase() === '.jpeg') {
        await resized
          .jpeg({ 
            quality: QUALITY.jpeg,
            progressive: true,
            mozjpeg: true
          })
          .toFile(path.join(outputDir, `${outputName}-optimized.jpg`));
      } else if (ext.toLowerCase() === '.png') {
        // Convert PNG to optimized JPEG
        await resized
          .jpeg({ 
            quality: QUALITY.jpeg,
            progressive: true,
            mozjpeg: true
          })
          .toFile(path.join(outputDir, `${outputName}.jpg`));
      }
    }
    
    console.log(`✓ Optimized ${filename}`);
  } catch (error) {
    console.error(`✗ Failed to optimize ${filename}:`, error.message);
  }
}

async function main() {
  console.log('Starting image optimization...');
  
  // Ensure output directory exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Get all image files, excluding already optimized files
  const files = fs.readdirSync(inputDir).filter(file => {
    const ext = path.extname(file).toLowerCase();
    const isValidImage = ['.jpg', '.jpeg', '.png'].includes(ext);
    
    // Skip files that are already optimized (contain optimization suffixes)
    const isOptimized = file.includes('-optimized') || 
                       file.includes('@2x') || 
                       file.includes('-lg') || 
                       file.includes('-md') || 
                       file.includes('-sm') ||
                       file.includes('.avif') ||
                       file.includes('.webp');
    
    return isValidImage && !isOptimized;
  });
  
  if (files.length === 0) {
    console.log('No images found to optimize.');
    return;
  }
  
  console.log(`Found ${files.length} images to optimize:`);
  files.forEach(file => console.log(`- ${file}`));
  console.log('');
  
  // Process each image
  for (const file of files) {
    const inputPath = path.join(inputDir, file);
    await optimizeImage(inputPath, file);
  }
  
  console.log('');
  console.log('✅ Image optimization complete!');
  console.log('Generated formats:');
  console.log('- AVIF (best compression)');
  console.log('- WebP (good compression)');
  console.log('- Optimized JPEG (fallback)');
  console.log('');
  console.log('Generated sizes:');
  SIZES.forEach(size => {
    console.log(`- ${size.width}px${size.suffix ? ` (${size.suffix})` : ' (original)'}`);
  });
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { optimizeImage, SIZES, QUALITY };