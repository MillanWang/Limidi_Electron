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
