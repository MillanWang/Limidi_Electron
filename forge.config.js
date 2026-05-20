const fs = require("fs");
const path = require("path");

// Load .env.local (notarization credentials) without adding a dependency.
// Existing process.env values take precedence, so CI can override.
(function loadDotenvLocal() {
  const filepath = path.resolve(__dirname, ".env.local");
  if (!fs.existsSync(filepath)) return;
  for (const rawLine of fs.readFileSync(filepath, "utf8").split("\n")) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
})();

const TEAM_ID = "Q4YV6V793U";

// CFBundleVersion must be monotonically increasing across releases (Apple
// uses it for auto-update and crash-report ordering). Marketing version
// lives in CFBundleShortVersionString. Falls back to "1" outside a git repo.
function getBuildNumber() {
  try {
    return require("child_process")
      .execSync("git rev-list --count HEAD", {
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      })
      .trim();
  } catch {
    return "1";
  }
}

// Electron's default Info.plist template includes usage-description strings
// for permissions LiMIDI does not request (camera, microphone, audio,
// bluetooth) plus NSAllowsArbitraryLoads. Strip them from the main app and
// every helper bundle after Forge writes the plists but before signing.
async function stripUnusedInfoPlistKeys(buildPath) {
  if (process.platform !== "darwin") return;
  const { execFileSync } = require("child_process");
  const contentsDir = path.resolve(buildPath, "..", "..");
  const frameworksDir = path.join(contentsDir, "Frameworks");
  const plists = [path.join(contentsDir, "Info.plist")];
  if (fs.existsSync(frameworksDir)) {
    for (const entry of fs.readdirSync(frameworksDir)) {
      if (!entry.endsWith(".app")) continue;
      const p = path.join(frameworksDir, entry, "Contents", "Info.plist");
      if (fs.existsSync(p)) plists.push(p);
    }
  }
  const keysToStrip = [
    "NSCameraUsageDescription",
    "NSMicrophoneUsageDescription",
    "NSAudioCaptureUsageDescription",
    "NSBluetoothAlwaysUsageDescription",
    "NSBluetoothPeripheralUsageDescription",
    "NSAppTransportSecurity",
  ];
  for (const plistPath of plists) {
    for (const key of keysToStrip) {
      try {
        execFileSync(
          "/usr/libexec/PlistBuddy",
          ["-c", `Delete :${key}`, plistPath],
          { stdio: "ignore" }
        );
      } catch {
        // Key wasn't present in this plist — fine.
      }
    }
  }
}

// Notarization auth: prefer App Store Connect API key, fall back to
// app-specific password. Returns undefined if no creds are set, in which case
// the build will sign but skip notarization.
function getOsxNotarizeConfig() {
  const {
    APPLE_API_KEY_PATH,
    APPLE_API_KEY_ID,
    APPLE_API_ISSUER,
    APPLE_ID,
    APPLE_APP_SPECIFIC_PASSWORD,
  } = process.env;

  if (APPLE_API_KEY_PATH && APPLE_API_KEY_ID && APPLE_API_ISSUER) {
    return {
      appleApiKey: APPLE_API_KEY_PATH,
      appleApiKeyId: APPLE_API_KEY_ID,
      appleApiIssuer: APPLE_API_ISSUER,
    };
  }
  if (APPLE_ID && APPLE_APP_SPECIFIC_PASSWORD) {
    return {
      appleId: APPLE_ID,
      appleIdPassword: APPLE_APP_SPECIFIC_PASSWORD,
      teamId: TEAM_ID,
    };
  }
  return undefined;
}

const config = {
  packagerConfig: {
    asar: true,
    name: "LiMIDI",
    executableName: "LiMIDI",
    appBundleId: "com.LiMIDI.electron",
    icon: "./assets/icons/icon", // Electron Forge will look for icon.ico (Windows) or icon.icns (macOS)
    // CFBundleVersion (macOS) / FileVersion (Windows): monotonically
    // increasing build number, distinct from the marketing version
    // (CFBundleShortVersionString) which Forge derives from package.json.
    buildVersion: getBuildNumber(),
    afterPrune: [
      async (buildPath, _electronVersion, _platform, _arch, callback) => {
        try {
          await stripUnusedInfoPlistKeys(buildPath);
          callback();
        } catch (err) {
          callback(err);
        }
      },
    ],
    osxSign: {
      identity: `Developer ID Application: Millan Wang (${TEAM_ID})`,
      optionsForFile: () => ({
        entitlements: "./entitlements.plist",
        hardenedRuntime: true,
        signatureFlags: "library",
      }),
    },
    ignore: [
      // VCS / editor / build outputs
      /^\/\.git($|\/)/,
      /^\/\.gitignore$/,
      /^\/\.vscode($|\/)/,
      /^\/out($|\/)/,
      /^\/icon($|\/)/,
      // Local secrets (Apple notarization creds, etc.) — must never ship
      /^\/\.env($|\..+)$/,
      // Source / config not needed at runtime (compiled output lives in /dist)
      /\.ts$/,
      /\.map$/,
      /^\/tsconfig\.json$/,
      /^\/forge\.config\.js$/,
      /^\/entitlements\.plist$/,
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
      // Native build intermediates (only the .node binary is needed at runtime)
      /^\/node_modules\/.+\/build\/Release\/\.deps($|\/)/,
      /^\/node_modules\/.+\/build\/Release\/obj\.target($|\/)/,
      /^\/node_modules\/.+\/build\/binding\.Makefile$/,
      /^\/node_modules\/.+\/build\/gyp-mac-tool$/,
      // Tests, examples, benchmarks, coverage reports inside dependencies
      /^\/node_modules\/.+\/(tests?|__tests__|examples?|benchmarks?|coverage)($|\/)/,
      // Dev-only metadata files inside dependencies
      /^\/node_modules\/.+\/\.github($|\/)/,
      /^\/node_modules\/.+\/tsconfig(\..+)?\.json$/,
      /^\/node_modules\/.+\/\.(eslintrc|nycrc|editorconfig|prettierrc|prettierignore|npmignore|coveralls\.yml|travis\.yml)($|\..+)$/,
      /^\/node_modules\/.+\/appveyor\.yml$/,
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
      name: "@electron-forge/maker-dmg",
      platforms: ["darwin"],
      config: {
        name: "LiMIDI",
        icon: "./assets/icons/icon.icns",
        format: "ULFO",
        additionalDMGOptions: {
          "code-sign": {
            "signing-identity": `Developer ID Application: Millan Wang (${TEAM_ID})`,
          },
        },
      },
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
  hooks: {
    // Electron ships its own MIT LICENSE at the root of the packaged
    // directory (next to the .app). Without intervention, users opening
    // the .zip see Electron's license as if it were the app's. Rename
    // Electron's LICENSE → LICENSE.electron and drop in our own.
    async postPackage(_forgeConfig, packageResult) {
      for (const outputPath of packageResult.outputPaths || []) {
        const electronLicense = path.join(outputPath, "LICENSE");
        if (fs.existsSync(electronLicense)) {
          fs.renameSync(
            electronLicense,
            path.join(outputPath, "LICENSE.electron")
          );
        }
        const ourLicense = path.resolve(__dirname, "LICENSE");
        if (fs.existsSync(ourLicense)) {
          fs.copyFileSync(ourLicense, path.join(outputPath, "LICENSE"));
        }
      }
    },
    // The dmg maker signs the .dmg but cannot notarize it. Submit each .dmg
    // to Apple via @electron/notarize, which also staples the ticket so
    // Gatekeeper can verify offline.
    async postMake(_forgeConfig, makeResults) {
      if (process.platform !== "darwin") return makeResults;
      const creds = getOsxNotarizeConfig();
      if (!creds) {
        console.warn(
          "[forge.config] postMake: no notarization credentials — skipping DMG notarization."
        );
        return makeResults;
      }
      const { notarize } = require("@electron/notarize");
      for (const result of makeResults) {
        for (const artifact of result.artifacts) {
          if (!artifact.endsWith(".dmg")) continue;
          console.log(`[forge.config] Notarizing ${artifact} …`);
          await notarize({ appPath: artifact, ...creds });
          console.log(`[forge.config] Notarized + stapled ${artifact}`);
        }
      }
      return makeResults;
    },
  },
};

const osxNotarize = getOsxNotarizeConfig();
if (osxNotarize) {
  config.packagerConfig.osxNotarize = osxNotarize;
} else if (process.platform === "darwin") {
  console.warn(
    "[forge.config] No notarization credentials in env — signing only. " +
      "Set APPLE_API_KEY_PATH/APPLE_API_KEY_ID/APPLE_API_ISSUER " +
      "(or APPLE_ID/APPLE_APP_SPECIFIC_PASSWORD) to notarize."
  );
}

module.exports = config;
