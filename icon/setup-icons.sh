#!/bin/bash
# Simple script to set up icons for Electron app
# This converts the SVG to PNG and sets up the icon structure

cd "$(dirname "$0")/.."

ASSETS_DIR="./assets"
SVG_ICON="$ASSETS_DIR/icon.svg"
PNG_ICON="$ASSETS_DIR/icon.png"

# Create assets directory if it doesn't exist
mkdir -p "$ASSETS_DIR"

# Check if SVG exists
if [ ! -f "$SVG_ICON" ]; then
    echo "Error: $SVG_ICON not found. Run generate-icon.js first."
    exit 1
fi

# Try to convert SVG to PNG using available tools
if command -v rsvg-convert &> /dev/null; then
    echo "Converting SVG to PNG using rsvg-convert..."
    rsvg-convert -w 512 -h 512 "$SVG_ICON" > "$PNG_ICON"
elif command -v convert &> /dev/null; then
    echo "Converting SVG to PNG using ImageMagick..."
    convert -resize 512x512 "$SVG_ICON" "$PNG_ICON"
elif command -v sips &> /dev/null; then
    # sips doesn't support SVG, so we'll need another method
    echo "Note: sips doesn't support SVG conversion."
    echo "Please convert $SVG_ICON to PNG manually or use an online converter."
    echo "Save it as: $PNG_ICON (512x512 pixels)"
else
    echo "No image conversion tool found."
    echo "Please convert $SVG_ICON to PNG manually:"
    echo "  - Use an online SVG to PNG converter"
    echo "  - Save as: $PNG_ICON (512x512 pixels)"
    exit 1
fi

if [ -f "$PNG_ICON" ]; then
    echo "✓ Icon created: $PNG_ICON"
    echo ""
    echo "Next steps:"
    echo "1. For Windows/macOS: Use electron-icon-builder to create .ico and .icns files:"
    echo "   npx electron-icon-builder --input=$PNG_ICON --output=$ASSETS_DIR --flatten"
    echo ""
    echo "2. Or manually create:"
    echo "   - icon.ico (for Windows)"
    echo "   - icon.icns (for macOS)"
    echo "   Both should be 512x512 or larger"
fi
