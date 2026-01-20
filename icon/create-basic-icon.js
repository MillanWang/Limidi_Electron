// Create a basic PNG icon from SVG using a simple approach
// This creates a minimal placeholder PNG that you can replace later

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const assetsDir = path.join(__dirname, '..', 'assets');
const svgPath = path.join(assetsDir, 'icon.svg');
const pngPath = path.join(assetsDir, 'icon.png');

if (!fs.existsSync(svgPath)) {
  console.error('icon.svg not found. Run generate-icon.js first.');
  process.exit(1);
}

console.log('Attempting to convert SVG to PNG...');

// Try different conversion methods
const methods = [
  {
    name: 'rsvg-convert',
    cmd: `rsvg-convert -w 512 -h 512 "${svgPath}" > "${pngPath}"`,
    check: 'rsvg-convert --version'
  },
  {
    name: 'ImageMagick',
    cmd: `convert -resize 512x512 "${svgPath}" "${pngPath}"`,
    check: 'convert -version'
  },
  {
    name: 'qemu-img (fallback)',
    cmd: null,
    check: null
  }
];

let converted = false;

for (const method of methods) {
  if (method.check) {
    try {
      execSync(method.check, { stdio: 'ignore' });
      if (method.cmd) {
        console.log(`Trying ${method.name}...`);
        execSync(method.cmd, { stdio: 'inherit' });
        if (fs.existsSync(pngPath)) {
          console.log(`✓ Successfully created icon.png using ${method.name}`);
          converted = true;
          break;
        }
      }
    } catch (e) {
      // Tool not available, try next
    }
  }
}

if (!converted) {
  console.log('\n⚠ Could not automatically convert SVG to PNG.');
  console.log('\nPlease convert the SVG icon manually:');
  console.log(`  1. Open: ${svgPath}`);
  console.log('  2. Use an online converter (search "svg to png")');
  console.log('  3. Save as: ' + pngPath);
  console.log('  4. Size: 512x512 pixels');
  console.log('\nOr install a conversion tool:');
  console.log('  - brew install librsvg (for rsvg-convert)');
  console.log('  - brew install imagemagick (for convert)');
}
