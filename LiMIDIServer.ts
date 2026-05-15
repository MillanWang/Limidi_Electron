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

function emitState(): void {
  const state: ConnectionState = activeConnections.size > 0 ? "connected" : "disconnected";
  serverEvents.emit("state", state);
}

export function startLiMIDIServer(port: number): void {
  const app = express();
  server = http.createServer(app);
  wss = new WebSocket.Server({ server });

  wss.on("connection", (ws) => {
    activeConnections.add(ws);
    if (activeConnections.size === 1) emitState();

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

  server.listen(port, () => {
    console.log(`Server running on port: ${port}`);
  });

  midiOutput = new Output("LiMIDI", true);
}

export function closeLiMIDIServer(): void {
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
