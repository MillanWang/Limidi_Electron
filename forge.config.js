module.exports = {
  packagerConfig: {
    asar: true,
    name: "Limidi",
    executableName: "limidi",
    appBundleId: "com.limidi.electron",
    appVersion: "1.0.0",
    icon: undefined, // Add path to .ico/.icns/.png icon if you have one
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
        },
      },
    },
    {
      name: "@electron-forge/maker-rpm",
      config: {
        options: {
          maintainer: "Millan Wang",
          homepage: "https://github.com/yourusername/limidi-electron",
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
