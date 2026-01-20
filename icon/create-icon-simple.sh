#!/bin/bash
# Simple script to create icon.png - works around npm issues

cd "$(dirname "$0")/.."

echo "Creating icon.png from SVG..."

# Check if we have conversion tools
if command -v rsvg-convert &> /dev/null; then
    echo "Using rsvg-convert..."
    rsvg-convert -w 512 -h 512 assets/icon.svg > assets/icon.png
    if [ -f "assets/icon.png" ]; then
        echo "✓ Successfully created assets/icon.png"
        exit 0
    fi
fi

if command -v convert &> /dev/null; then
    echo "Using ImageMagick..."
    convert -resize 512x512 assets/icon.svg assets/icon.png
    if [ -f "assets/icon.png" ]; then
        echo "✓ Successfully created assets/icon.png"
        exit 0
    fi
fi

# If no tools available, provide instructions
echo ""
echo "⚠ No conversion tools found. Please choose one:"
echo ""
echo "Option 1: Install librsvg (recommended)"
echo "  brew install librsvg"
echo "  Then run this script again"
echo ""
echo "Option 2: Use online converter"
echo "  1. Open assets/icon.svg in a browser"
echo "  2. Go to https://cloudconvert.com/svg-to-png"
echo "  3. Upload the SVG, set size to 512x512"
echo "  4. Download and save as assets/icon.png"
echo ""
echo "Option 3: Use macOS Preview"
echo "  1. Open assets/icon.svg in Preview"
echo "  2. File > Export"
echo "  3. Format: PNG, Size: 512x512"
echo "  4. Save as assets/icon.png"
