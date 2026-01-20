const fs = require('fs');
const path = require('path');

// Create a simple SVG icon
const svgIcon = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="512" height="512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#6366f1;stop-opacity:1" />
      <stop offset="100%" style="stop-color:#8b5cf6;stop-opacity:1" />
    </linearGradient>
  </defs>
  <rect width="512" height="512" rx="100" fill="url(#grad)"/>
  <text x="256" y="320" font-family="Arial, sans-serif" font-size="280" font-weight="bold" fill="white" text-anchor="middle">L</text>
</svg>`;

const assetsDir = path.join(__dirname, '..', 'assets');
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Save SVG icon
const svgPath = path.join(assetsDir, 'icon.svg');
fs.writeFileSync(svgPath, svgIcon);
console.log('Created icon.svg');

// Note: For production, you'll want to convert this SVG to PNG/ICO/ICNS formats
// You can use tools like:
// - ImageMagick: convert icon.svg -resize 512x512 icon.png
// - Online converters
// - Or install sharp: npm install --save-dev sharp
console.log('\nTo create PNG/ICO/ICNS files, you can:');
console.log('1. Use an online SVG to PNG converter');
console.log('2. Install sharp and run: node convert-icon.js');
console.log('3. Use ImageMagick: convert assets/icon.svg -resize 512x512 assets/icon.png');
