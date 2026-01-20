// Create PNG icon using pngjs (zero external dependencies)
// Install: npm install pngjs
// Run: node create-icon-png.js

const fs = require('fs');
const path = require('path');

try {
  const { PNG } = require('pngjs');
  
  const size = 512;
  const png = new PNG({ width: size, height: size });
  
  // Create a gradient background (purple/indigo theme for "Limidi")
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const idx = (size * y + x) << 2;
      
      // Gradient from top-left (indigo) to bottom-right (purple)
      const ratio = (x + y) / (size * 2);
      const r = Math.floor(99 + ratio * 56);   // 99-155 (indigo to purple)
      const g = Math.floor(102 + ratio * 53);  // 102-155
      const b = Math.floor(241 - ratio * 105); // 241-136
      
      png.data[idx] = r;       // Red
      png.data[idx + 1] = g;   // Green
      png.data[idx + 2] = b;   // Blue
      png.data[idx + 3] = 255; // Alpha
    }
  }
  
  // Draw a simple "L" shape (white, bold)
  const letterSize = size * 0.6;
  const thickness = size * 0.15;
  const offsetX = size * 0.25;
  const offsetY = size * 0.2;
  
  // Vertical line of L
  for (let y = offsetY; y < size - offsetY; y++) {
    for (let x = offsetX; x < offsetX + thickness; x++) {
      const idx = (size * y + x) << 2;
      png.data[idx] = 255;     // Red
      png.data[idx + 1] = 255; // Green
      png.data[idx + 2] = 255; // Blue
      png.data[idx + 3] = 255; // Alpha
    }
  }
  
  // Horizontal line of L
  for (let y = size - offsetY - thickness; y < size - offsetY; y++) {
    for (let x = offsetX; x < offsetX + letterSize; x++) {
      const idx = (size * y + x) << 2;
      png.data[idx] = 255;     // Red
      png.data[idx + 1] = 255; // Green
      png.data[idx + 2] = 255; // Blue
      png.data[idx + 3] = 255; // Alpha
    }
  }
  
  const assetsDir = path.join(__dirname, '..', 'assets');
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }
  
  const pngPath = path.join(assetsDir, 'icon.png');
  png.pack().pipe(fs.createWriteStream(pngPath))
    .on('finish', () => {
      console.log('✓ Successfully created icon.png at', pngPath);
      console.log('  Size: 512x512 pixels');
    });
    
} catch (err) {
  if (err.code === 'MODULE_NOT_FOUND') {
    console.error('pngjs is not installed.');
    console.log('Install it with: npm install pngjs');
    console.log('(pngjs has zero external dependencies)');
  } else {
    console.error('Error creating icon:', err);
  }
  process.exit(1);
}
