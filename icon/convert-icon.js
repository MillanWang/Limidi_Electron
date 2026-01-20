// Optional: Convert SVG to PNG using sharp
// Run: npm install --save-dev sharp
// Then: node convert-icon.js

try {
  const sharp = require('sharp');
  const fs = require('fs');
  const path = require('path');

  const assetsDir = path.join(__dirname, '..', 'assets');
  const svgPath = path.join(assetsDir, 'icon.svg');
  const pngPath = path.join(assetsDir, 'icon.png');

  if (!fs.existsSync(svgPath)) {
    console.error('icon.svg not found. Run generate-icon.js first.');
    process.exit(1);
  }

  sharp(svgPath)
    .resize(512, 512)
    .png()
    .toFile(pngPath)
    .then(() => {
      console.log('Successfully created icon.png');
    })
    .catch((err) => {
      console.error('Error converting icon:', err);
      console.log('Make sure sharp is installed: npm install --save-dev sharp');
    });
} catch (err) {
  console.error('sharp is not installed. Install it with: npm install --save-dev sharp');
  process.exit(1);
}
