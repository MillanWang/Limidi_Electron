import express from "express";
import { Output } from "easymidi";
import { replaceElementText, setElementClass } from "./utils";
import * as Proto from "./proto_bundle";
import http from "http";
import WebSocket from "ws";

const { WrapperMessage } = Proto;

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

// Track active connections to prevent UI state collisions
const activeConnections = new Set<WebSocket>();

// WebSocket connection handling
wss.on("connection", (ws) => {
  // Add this connection to the active set
  activeConnections.add(ws);

  // Update UI to Connected if this is the first connection
  if (activeConnections.size === 1) {
    replaceElementText("connection-status", "Connected");
    setElementClass("status-dot", "connected", true);
    setElementClass("status-dot", "disconnected", false);
  }

  ws.on("message", (message: WebSocket.RawData) => {
    const buffer = new Uint8Array(message as ArrayBuffer);
    const decodedMessage = WrapperMessage.decode(buffer);

    if (decodedMessage.midiNote) {
      const { isNoteOn, noteNumber, velocity } = decodedMessage.midiNote;
      sendMidiNote(isNoteOn, noteNumber, velocity);
    } else if (decodedMessage.controlChange) {
      const { controlIndex, level } = decodedMessage.controlChange;
      sendControlChange(controlIndex, level);
    }

    ws.send(`Echo: ${message}`);
  });

  ws.on("close", () => {
    console.log("WebSocket connection closed");
    // Remove this connection from the active set
    activeConnections.delete(ws);

    // Only set UI to Disconnected if this was the last active connection
    if (activeConnections.size === 0) {
      replaceElementText("connection-status", "Disconnected");
      setElementClass("status-dot", "connected", false);
      setElementClass("status-dot", "disconnected", true);
    }
  });

  ws.send("LiMIDI Desktop connected");
});

let midiOutput: Output | null = null;

export function startLiMIDIServer(port: number): void {
  server.listen(port, () => {
    console.log(`Server running on port: ${port}`);
  });

  midiOutput = new Output("LiMIDI", true);
}

export function closeLiMIDIServer(): void {
  if (midiOutput) {
    midiOutput.close();
    midiOutput = null;
  }
  if (server) {
    server.close();
  }
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
