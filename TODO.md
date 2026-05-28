# TODO

Open items after the distribution review (see `DISTRIBUTION_REVIEW.md` for
the overall status). Each entry keeps the rationale so future-me knows
whether the work is still worth doing.

## Should fix before the next public release

### 1. WebSocket server still has no client authentication

`LiMIDIServer.ts` is now bound to the chosen LAN interface only and
caps concurrent WS connections at `MAX_CONCURRENT_CONNECTIONS`, so
VPN / Docker / secondary-interface clients can't reach it and an
attacker on the LAN can't flood the socket. The pairing code/QR is
still security-through-obscurity, though: anyone on the same Wi-Fi who
can port-scan 4848–5050 still reaches the server and can stuff
arbitrary MIDI into the user's DAW.

Remaining mitigations:

- Require the client to present the encoded pairing code in its first
  message before sending any MIDI. Needs a matching change in the
  phone app, so deferred until that ships.
- Document the threat model so users don't run this on untrusted Wi-Fi.
