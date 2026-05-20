# LiMIDI Electron

LiMIDI turns your phone into a wireless MIDI controller. This desktop app
runs a small server on your local network, creates a virtual MIDI output
named `LiMIDI`, and shows a QR code that the LiMIDI phone app scans to
pair.

## Installing (macOS)

1. Download `LiMIDI.dmg` from the latest release.
2. Open the DMG and drag **LiMIDI** to the **Applications** folder.
3. Open Applications and double-click LiMIDI. Gatekeeper verifies the
   app's notarization on first launch and remembers the decision.

## Using the app

1. Connect this computer and your phone to the **same Wi-Fi network**.
2. Launch LiMIDI. A QR code and a short pairing code appear.
3. In the LiMIDI phone app, scan the QR (or type the pairing code).
4. In your DAW or MIDI host, select **LiMIDI** as the input device.

The status row at the bottom of the window shows `Connected` when the
phone is paired.

## Firewall

On first launch, macOS / Windows will ask whether to allow incoming
network connections. **Allow it** — the phone needs to reach the desktop
over the LAN. The app listens on a port in the range 4848-5050.

## Development

```sh
npm install
npm start          # build + launch via electron-forge
npm run package    # bundle the signed .app (no installers)
npm run make       # produce distributable artifacts in out/make/
```

`npm run make` produces both the **DMG** (signed + notarized, the public
macOS artifact) and a `.zip` (mostly for CI / direct-download workflows).
End users get the DMG.

Source layout:

- `main.ts` — Electron main process; owns the WebSocket / MIDI server.
- `preload.ts` — Bridges a minimal IPC API into the renderer.
- `renderer.ts` — UI script (no Node access).
- `LiMIDIServer.ts` — WebSocket server + virtual MIDI output.
- `index.html` / `styles.css` — UI.

See `TODO.md` for known issues and packaging follow-ups.
