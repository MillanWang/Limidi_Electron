const express = require("express");
const { Output, Input, getInputs, getOutputs } = require("easymidi");
const { replaceElementText, setElementClass } = require("./utils");

const Proto = require("./proto_bundle"); // or import if using ES modules
const { WrapperMessage } = Proto;

const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app); // Create HTTP server from Express app
const wss = new WebSocket.Server({ server }); // Attach WebSocket server to it

// Track active connections to prevent UI state collisions
const activeConnections = new Set();

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

  ws.on("message", (message) => {
    const buffer = new Uint8Array(message);
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

  ws.send("Limidi Desktop connected");
});

let midiOutput;

function startLimidiServer(port) {
  server.listen(port, () => {
    console.log(`Server running on port: ${port}`);
  });

  midiOutput = new Output("Limidi", true);
}

function closeLimidiServer() {
  if (midiOutput) {
    midiOutput.close();
    midiOutput = null;
  }
  if (server) {
    server.close();
  }
}

function sendMidiNote(isNoteOn, noteNumber, velocity) {
  midiOutput.send(isNoteOn ? "noteon" : "noteoff", {
    note: noteNumber,
    velocity: isNoteOn ? velocity : 0,
    channel: 0,
  });
}

function sendControlChange(controlIndex, level) {
  midiOutput.send("cc", {
    controller: controlIndex,
    value: level,
    channel: 0,
  });
}

module.exports = {
  startLimidiServer,
  closeLimidiServer,
};
