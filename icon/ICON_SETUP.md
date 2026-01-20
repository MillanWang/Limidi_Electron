# Icon Setup Instructions

Your Electron app is configured to use icons, but you need to create the icon files in the proper formats.

**Note:** All icon management scripts are located in the `icon/` folder. Run scripts from the project root.

## Current Status

✅ SVG icon created at: `assets/icon.svg`
- This is a gradient icon with a white "L" letter
- Size: 512x512 pixels

## Required Icon Files

You need to create these icon files in the `assets/icons/` directory:

1. **512x512.png** - For Linux (or use `icon.png` in assets root)
2. **icon.ico** - For Windows (in `assets/icons/`)
3. **icon.icns** - For macOS (in `assets/icons/`)

## Quick Setup Options

### Option 1: Fix npm and Auto-Convert (Recommended)

If you're getting npm permission errors, run this script from the project root:

```bash
./icon/fix-npm-and-create-icons.sh
```

This will:
1. Fix npm cache permissions
2. Convert SVG to PNG automatically (if tools are available)
3. Provide next steps

### Option 2: Use Online Converter (Easiest - No npm needed)

1. Go to an online SVG to PNG converter (e.g., cloudconvert.com, convertio.co)
2. Upload `assets/icon.svg`
3. Convert to PNG (512x512) and save as `assets/icons/512x512.png`
4. For Windows: Convert PNG to ICO format, save as `assets/icons/icon.ico`
5. For macOS: Convert PNG to ICNS format, save as `assets/icons/icon.icns`

### Option 3: Use electron-icon-builder (After fixing npm)

First fix npm permissions:
```bash
sudo chown -R $(whoami) ~/.npm
```

Then once you have `assets/icons/512x512.png`, run:

```bash
npx electron-icon-builder --input=./assets/icons/512x512.png --output=./assets/icons --flatten
```

This will automatically create all required formats (.ico, .icns, .png) from your PNG file.

### Option 4: Use Helper Scripts

From the project root, you can use the helper scripts in the `icon/` folder:

```bash
# Generate the SVG icon (if needed)
node icon/generate-icon.js

# Create PNG from SVG (if you have conversion tools)
./icon/create-icon-simple.sh

# Or use the basic conversion script
node icon/create-basic-icon.js
```

### Option 5: Use ImageMagick

If you have ImageMagick installed:

```bash
# Convert SVG to PNG
convert assets/icon.svg -resize 512x512 assets/icons/512x512.png

# Convert PNG to ICO (Windows)
convert assets/icons/512x512.png assets/icons/icon.ico

# Convert PNG to ICNS (macOS) - requires iconutil or online tool
```

### Option 6: Manual Creation

1. Open `assets/icon.svg` in an image editor (Photoshop, GIMP, etc.)
2. Export as PNG (512x512) → `assets/icons/512x512.png`
3. Export as ICO (512x512) → `assets/icons/icon.ico`  
4. Export as ICNS (512x512) → `assets/icons/icon.icns`

## Verification

After creating the icon files, verify they exist:

```bash
ls -la assets/icons/
```

You should see:
- `512x512.png` (or various sizes)
- `icon.ico` (for Windows builds)
- `icon.icns` (for macOS builds)

## Icon Scripts Location

All icon management scripts are located in the `icon/` folder:
- `generate-icon.js` - Creates the base SVG icon
- `create-icon-simple.sh` - Simple PNG conversion script
- `fix-npm-and-create-icons.sh` - Fixes npm and creates icons
- `convert-icon.js` - Converts SVG to PNG using sharp
- `create-icon-png.js` - Creates PNG using pngjs
- `create-basic-icon.js` - Basic conversion script
- `setup-icons.sh` - Sets up icon structure

Run these scripts from the **project root**, not from inside the `icon/` folder.

## Build Your App

Once the icons are in place, build your app:

```bash
npm run make
```

The icons will be automatically included in your distributable packages!

## File Structure

```
Limidi_Electron/
├── assets/
│   ├── icon.svg          # Source SVG icon
│   ├── icon.png          # Optional: root level PNG
│   └── icons/            # Platform-specific icons
│       ├── 512x512.png   # Linux icon
│       ├── icon.ico      # Windows icon
│       └── icon.icns     # macOS icon
└── icon/                 # Icon management scripts
    ├── ICON_SETUP.md     # This file
    ├── generate-icon.js
    ├── create-icon-simple.sh
    └── ... (other scripts)
```
