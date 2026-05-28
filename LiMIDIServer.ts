import express from "express";
import { Output } from "easymidi";
import * as Proto from "./proto_bundle";
import http from "http";
import { EventEmitter } from "events";
import WebSocket from "ws";

const { WrapperMessage } = Proto;

export type ConnectionState = "connected" | "disconnected";

export const serverEvents = new EventEmitter();

let server: http.Server | null = null;
let wss: WebSocket.Server | null = null;
let midiOutput: Output | null = null;
const activeConnections = new Set<WebSocket>();

// Legitimate use is one phone at a time. The small headroom absorbs
// reconnect overlap (old socket still in CLOSING while the new one
// arrives) without giving an attacker on the LAN room to flood us.
const MAX_CONCURRENT_CONNECTIONS = 4;

// A phone that loses wifi mid-session never sends a TCP FIN, so the
// socket stays half-open and `ws.on("close")` never fires — the UI
// would keep showing "Connected" for ~hours until OS keepalive notices.
// We send a WS-level ping every interval and terminate any socket that
// didn't pong since the previous tick, which surfaces the dead client
// within one to two intervals.
const HEARTBEAT_INTERVAL_MS = 5000;
const aliveSockets = new WeakMap<WebSocket, boolean>();
let heartbeatTimer: NodeJS.Timeout | null = null;

function emitState(): void {
  const state: ConnectionState = activeConnections.size > 0 ? "connected" : "disconnected";
  serverEvents.emit("state", state);
}

export function startLiMIDIServer(port: number, ip: string): void {
  const app = express();
  server = http.createServer(app);
  wss = new WebSocket.Server({ server });

  wss.on("connection", (ws) => {
    if (activeConnections.size >= MAX_CONCURRENT_CONNECTIONS) {
      ws.close(1008, "too many connections");
      return;
    }
    activeConnections.add(ws);
    aliveSockets.set(ws, true);
    if (activeConnections.size === 1) emitState();

    ws.on("pong", () => aliveSockets.set(ws, true));

    ws.on("message", (message: WebSocket.RawData) => {
      try {
        const buffer = new Uint8Array(message as ArrayBuffer);
        const decodedMessage = WrapperMessage.decode(buffer);

        if (decodedMessage.midiNote) {
          const { isNoteOn, noteNumber, velocity } = decodedMessage.midiNote;
          sendMidiNote(isNoteOn, noteNumber, velocity);
        } else if (decodedMessage.controlChange) {
          const { controlIndex, level } = decodedMessage.controlChange;
          sendControlChange(controlIndex, level);
        }
      } catch (err) {
        console.error("Dropping malformed message:", err);
        ws.close(1003, "malformed message");
      }
    });

    ws.on("close", () => {
      activeConnections.delete(ws);
      if (activeConnections.size === 0) emitState();
    });

    ws.send("LiMIDI Desktop connected");
  });

  // Bind to the chosen LAN interface only — listening on 0.0.0.0 would also
  // accept clients via VPN tunnels, Docker bridges, and other secondary
  // interfaces the user never intended to expose LiMIDI on.
  server.listen(port, ip, () => {
    console.log(`Server running on ${ip}:${port}`);
  });

  heartbeatTimer = setInterval(() => {
    for (const ws of activeConnections) {
      if (aliveSockets.get(ws) === false) {
        // No pong since the previous tick — terminate() fires "close"
        // so the existing cleanup path removes it from activeConnections
        // and emits the disconnected state.
        ws.terminate();
        continue;
      }
      aliveSockets.set(ws, false);
      ws.ping();
    }
  }, HEARTBEAT_INTERVAL_MS);

  midiOutput = new Output("LiMIDI", true);
}

export function closeLiMIDIServer(): void {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
  }

  for (const ws of activeConnections) ws.terminate();
  activeConnections.clear();

  if (midiOutput) {
    midiOutput.close();
    midiOutput = null;
  }
  if (wss) {
    wss.close();
    wss = null;
  }
  if (server) {
    server.close();
    server = null;
  }
  emitState();
}

function sendMidiNote(isNoteOn: boolean, noteNumber: number, velocity: number): void {
  if (!midiOutput) return;
  if (isNoteOn) {
    midiOutput.send("noteon", { note: noteNumber, velocity, channel: 0 });
  } else {
    midiOutput.send("noteoff", { note: noteNumber, velocity: 0, channel: 0 });
  }
}

function sendControlChange(controlIndex: number, level: number): void {
  if (!midiOutput) return;
  midiOutput.send("cc", {
    controller: controlIndex,
    value: level,
    channel: 0,
  });
}
