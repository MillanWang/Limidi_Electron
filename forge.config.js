module.exports = {
  packagerConfig: {
    asar: true,
    name: "Limidi",
    executableName: "limidi",
    appBundleId: "com.limidi.electron",
    appVersion: "1.0.0",
    icon: "./assets/icons/icon", // Electron Forge will look for icon.ico (Windows) or icon.icns (macOS)
  },
  rebuildConfig: {},
  makers: [
    {
      name: "@electron-forge/maker-squirrel",
      config: {
        name: "limidi",
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
          homepage: "https://github.com/yourusername/limidi-electron",
          icon: "./assets/icons/512x512.png", // Linux requires PNG
        },
      },
    },
    {
      name: "@electron-forge/maker-rpm",
      config: {
        options: {
          maintainer: "Millan Wang",
          homepage: "https://github.com/yourusername/limidi-electron",
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
