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

## 8. Pick the right network interface (review #8)

`getSubnetIP` in `networkingInfo.ts` returns the first non-internal IPv4
address. On most laptops that's a Docker / VPN / `utun` interface, not the
Wi-Fi the phone is on, so the QR code is unscannable.

- Prefer addresses in the private ranges `192.168.`, `10.`, `172.16-31.`.
- De-prioritise interfaces whose names start with `utun`, `bridge`,
  `vmnet`, `vbox`, `docker`, `tailscale`, `wg`.
- Stretch: surface all candidates in the UI and let the user pick.

## 14. Lighten the "Restart" button (review #14)

The button currently fires `app.relaunch() + app.exit(0)`, which is heavy
for what is conceptually "refresh the server / regenerate the QR".

- Re-create `http.Server` / `WebSocketServer` in place and re-render the
  QR (the server is already re-startable after the #11 fix).
- Rename the button to "Refresh connection" so the user knows nothing
  destructive is happening.

## Smaller stuff

- `tsconfig.json` lists each source file in `include`. Replace with
  `"include": ["**/*.ts", "proto_bundle.js"]` plus an `exclude` for
  `node_modules`, `dist`, `out`.
- The `postbuild` step copies `proto_bundle.js` into `dist/`. Since the
  file is already in `tsconfig.json > include`, `tsc` will emit it
  directly — drop the `cp` step.
- `node-gyp` is in `dependencies` but it is only needed at build time.
  Move it to `devDependencies`.
- `easymidi` is a native module. Confirm that
  `out/<platform>/LiMIDI.app/Contents/Resources/app.asar.unpacked/node_modules/easymidi`
  contains a rebuilt binary for the target Electron version (the
  `plugin-auto-unpack-natives` plugin should handle this).
