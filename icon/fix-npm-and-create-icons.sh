#!/bin/bash
# Fix npm cache permissions and create icons

echo "=== Fixing npm cache permissions ==="
echo "This will fix the npm cache permission issue..."
echo ""

# Fix npm cache permissions
if [ -d "$HOME/.npm" ]; then
    echo "Fixing npm cache permissions..."
    sudo chown -R $(whoami) "$HOME/.npm"
    echo "✓ npm cache permissions fixed"
else
    echo "⚠ npm cache directory not found"
fi

echo ""
echo "=== Creating icon.png from SVG ==="

# Try different methods to convert SVG to PNG
cd "$(dirname "$0")/.."

if command -v rsvg-convert &> /dev/null; then
    echo "Using rsvg-convert..."
    rsvg-convert -w 512 -h 512 assets/icon.svg > assets/icon.png
    echo "✓ Created icon.png"
elif command -v convert &> /dev/null; then
    echo "Using ImageMagick..."
    convert -resize 512x512 assets/icon.svg assets/icon.png
    echo "✓ Created icon.png"
else
    echo "⚠ No conversion tool found. Please:"
    echo "  1. Install librsvg: brew install librsvg"
    echo "  2. Or use an online SVG to PNG converter"
    echo "  3. Save as: assets/icon.png (512x512)"
    exit 1
fi

if [ -f "assets/icon.png" ]; then
    echo ""
    echo "=== Creating platform-specific icons ==="
    echo "Now you can run:"
    echo "  npx electron-icon-builder --input=./assets/icon.png --output=./assets --flatten"
    echo ""
    echo "Or create manually:"
    echo "  - icon.ico (Windows) - use online converter"
    echo "  - icon.icns (macOS) - use online converter or iconutil"
fi
