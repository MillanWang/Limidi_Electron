# LiMIDI `out/` Distribution Readiness Review

Analysis of `out/` after `npm run make` (macOS arm64 build, 2026-05-19).

The `.app` and the `.dmg` are both properly signed with a Developer ID Application certificate, hardened runtime is enabled on the app with minimal entitlements, and the notarization ticket is stapled to both. No remaining blockers for distribution.

---

## Open items

### 1. Only one platform is built

`out/` contains `darwin-arm64` only. `forge.config.js` declares squirrel, deb, and rpm makers, but `electron-forge make` builds only the host platform by default.

For "public distribution" you likely also want:

- Intel macOS (`--arch=x64`) or a universal binary (`--arch=universal`)
- Windows (squirrel installer)
- Linux (deb / rpm)

This needs a build matrix (CI or multiple local runs).

---

## What's already good

- App and DMG both signed by `Developer ID Application: Millan Wang (Q4YV6V793U)`
- Hardened runtime enabled with minimal entitlements (`allow-jit` only)
- Notarization ticket stapled on both `.app` and `.dmg`
- `spctl -a` accepts both as "Notarized Developer ID"
- ASAR integrity hash present in `Info.plist`
- Info.plist contains only permission descriptions actually used by the app
- `CFBundleVersion` set to a monotonically increasing build number (git commit count)
- Top-level `LICENSE` is the project's own MIT license; Electron's preserved as `LICENSE.electron`
- TypeScript sources, dev dependencies, and tooling files excluded from the asar
