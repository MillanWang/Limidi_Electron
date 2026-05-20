# TODO

Open items after the distribution review (see `DISTRIBUTION_REVIEW.md` for
the overall status). Each entry keeps the rationale so future-me knows
whether the work is still worth doing.

## Should fix before the next public release

### 1. WebSocket server has no origin check, no auth, no rate limit

`LiMIDIServer.ts:27,59` binds to `0.0.0.0` and accepts any connection on
the LAN. The pairing code/QR is security-through-obscurity: port-scan
4848–5050 reaches the server, and from there an attacker on the same
Wi-Fi can stuff arbitrary MIDI into the user's DAW. Fine on a home
network, risky on cafés / conferences / shared coworking.

Mitigations in order of impact:

- Bind to the chosen interface IP only (`server.listen(port, ip)`), so
  devices on VPNs / secondary nets can't see it.
- Require the client to present the encoded pairing code in its first
  message before sending any MIDI.
- Rate-limit incoming connections / reject after N concurrent.

At minimum, document the threat model so users don't run this on
untrusted Wi-Fi.

### 2. Incoming MIDI values aren't bounds-checked

`LiMIDIServer.ts:85-101` forwards `noteNumber`, `velocity`, `controlIndex`,
`level` straight to `easymidi.Output.send()`. MIDI requires 0–127; out-
of-range values reach RtMidi where behavior is undefined (crash, junk
output, etc.). Clamp or reject before sending.

## Carried forward from the original packaging review

### 3. Build for Intel Macs and other OSes

`maker-zip` is gated to `platforms: ["darwin"]` and the build is arm64
only, so Intel Mac / Windows / Linux users get nothing.

- Set `packagerConfig.arch = ['arm64', 'x64']` (or `'universal'`) and
  invoke `electron-forge make --arch=universal`.
- Add `"win32"` and `"linux"` to the zip maker's `platforms` array.

### 4. Lighten the "Restart" button

The button currently fires `app.relaunch() + app.exit(0)`, which is heavy
for what is conceptually "refresh the server / regenerate the QR".

- Re-create `http.Server` / `WebSocketServer` in place and re-render the
  QR.
- Rename the button to "Refresh connection" so the user knows nothing
  destructive is happening.

## Nice-to-have, not blocking distribution

### 5. No auto-update mechanism

Users have no in-app signal when a newer version exists. Consider
`update-electron-app` (drop-in, uses `update.electronjs.org`) once we
have a release cadence worth subscribing to.

### 6. No crash reporter wired up

Electron's built-in `crashReporter` is unconfigured, so we have zero
visibility into bugs users hit. Optional for hobby distribution; worth
turning on if user count grows.

### 7. `devTools = false` is a `const`, not env-gated

`main.ts:13` — works, but flipping it for local debugging requires a
code edit. Make it `process.env.NODE_ENV !== "production"` or similar.

---

## Already done (for reference; not actionable)

These were items the distribution review surfaced and are now resolved in
the codebase — listed here so nobody re-opens them:

- Sign + notarize + staple the `.app`
- Sign + notarize + staple the `.dmg`
- Strip notarization credentials (`.env.local`) and dev cruft from the
  packaged `app.asar`
- Tighten entitlements to `allow-jit` only
- Strip unused permission usage-description strings from `Info.plist`
- Use a monotonically increasing `CFBundleVersion` (git commit count)
- Ship the project's own MIT `LICENSE` at the zip root; keep Electron's
  as `LICENSE.electron`
- README "is damaged" workaround removed; replaced with real install
  instructions for the signed DMG
- README "Development" section clarified — DMG is the public artifact,
  zip is for CI / direct download
- `bootServer()` no longer swallows port-exhaustion: shows
  "No available port in 4848–5050. Close conflicting apps and Restart."
- Single-instance lock added in `main.ts`; second launch focuses the
  existing window instead of creating a duplicate virtual MIDI port
