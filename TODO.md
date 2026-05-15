# TODO

Items deferred from the packaging review. Each entry keeps the rationale so
future-me knows whether the work is still worth doing.

## 1. Sign and notarize the macOS app (review #1)

The current `.zip` workflow ends with Gatekeeper telling the user that
"LiMIDI is damaged and can't be opened" because the quarantine bit is set
on the unzipped `.app` and the bundle has no Developer ID signature.

- Real fix: add `osxSign` and `osxNotarize` blocks to
  `forge.config.js > packagerConfig` (requires an Apple Developer ID,
  app-specific password, and `APPLE_ID` / `APPLE_API_KEY` env vars in CI).
- Cheap fix: ship a `README` next to the `.app` inside the zip with the
  workaround `xattr -dr com.apple.quarantine /Applications/LiMIDI.app`.

## 2. Build for Intel Macs and other OSes (review #2)

`maker-zip` is currently gated to `platforms: ["darwin"]` and the build is
arm64 only, so Intel Mac users get nothing.

- Set `packagerConfig.arch = ['arm64', 'x64']` (or `'universal'`) and
  invoke `electron-forge make --arch=universal`.
- Add `"win32"` and `"linux"` to the zip maker's `platforms` array so
  Windows / Linux users have a portable artifact too.

## 14. Lighten the "Restart" button (review #14)

The button currently fires `app.relaunch() + app.exit(0)`, which is heavy
for what is conceptually "refresh the server / regenerate the QR".

- Re-create `http.Server` / `WebSocketServer` in place and re-render the
  QR (the server is already re-startable after the #11 fix).
- Rename the button to "Refresh connection" so the user knows nothing
  destructive is happening.
