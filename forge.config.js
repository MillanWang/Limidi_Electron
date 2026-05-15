module.exports = {
  packagerConfig: {
    asar: true,
    name: "LiMIDI",
    executableName: "LiMIDI",
    appBundleId: "com.LiMIDI.electron",
    icon: "./assets/icons/icon", // Electron Forge will look for icon.ico (Windows) or icon.icns (macOS)
    ignore: [
      // VCS / editor / build outputs
      /^\/\.git($|\/)/,
      /^\/\.gitignore$/,
      /^\/\.vscode($|\/)/,
      /^\/out($|\/)/,
      /^\/icon($|\/)/,
      // Source / config not needed at runtime (compiled output lives in /dist)
      /\.ts$/,
      /\.map$/,
      /^\/tsconfig\.json$/,
      /^\/forge\.config\.js$/,
      /^\/TODO\.md$/,
      /^\/README\.md$/,
      /^\/yarn\.lock$/,
      /^\/package-lock\.json$/,
      // Dev-only dependencies that hoist into node_modules
      /^\/node_modules\/@types($|\/)/,
      /^\/node_modules\/@electron-forge($|\/)/,
      /^\/node_modules\/electron($|\/)/,
      /^\/node_modules\/typescript($|\/)/,
      /^\/node_modules\/node-gyp($|\/)/,
      // Docs / native build artefacts inside dependencies
      /\.md$/i,
      /\.markdown$/i,
      /\.(cpp|cc|h|hpp|gyp|gypi|mk)$/,
      /(^|\/)Makefile$/,
      /(^|\/)binding\.gyp$/,
    ],
  },
  rebuildConfig: {},
  makers: [
    {
      name: "@electron-forge/maker-squirrel",
      config: {
        name: "LiMIDI",
      },
    },
    {
      name: "@electron-forge/maker-zip",
      platforms: ["darwin"],
    },
    {
      name: "@electron-forge/maker-deb",
      config: {
        options: {
          maintainer: "Millan Wang",
          icon: "./assets/icons/512x512.png", // Linux requires PNG
        },
      },
    },
    {
      name: "@electron-forge/maker-rpm",
      config: {
        options: {
          maintainer: "Millan Wang",
          icon: "./assets/icons/512x512.png", // Linux requires PNG
        },
      },
    },
  ],
  plugins: [
    {
      name: "@electron-forge/plugin-auto-unpack-natives",
      config: {},
    },
  ],
};
