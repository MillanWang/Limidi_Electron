const express = require("express");
const { Output, Input, getInputs, getOutputs } = require("easymidi");
const { replaceElementText } = require("./utils");

const Proto = require("./proto_bundle"); // or import if using ES modules
const { WrapperMessage } = Proto;

const http = require("http");
const WebSocket = require("ws");

const app = express();
const server = http.createServer(app); // Create HTTP server from Express app
const wss = new WebSocket.Server({ server }); // Attach WebSocket server to it

// WebSocket connection handling
wss.on("connection", (ws) => {
  replaceElementText("connection-status", "Connected");

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
    replaceElementText("connection-status", "Disconnected");
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
