const express = require("express");
const { Output, Input, getInputs, getOutputs } = require("easymidi");

const isWindows = process.platform === "win32";

const app = express();
let server;
let midiOutput;
function startLimidiServer(port) {
  server = app.listen(port, "0.0.0.0", () => {
    if (isWindows) {
      // On windows, connect to loopmidi - FOR NOW UNTIL TeVirtualMidi can be integrated and lisenced with proper installation
      try {
        const loopMidiInputName = "mill";
        midiOutput = new Output(loopMidiInputName);
      } catch (e) {
        console.log("input name not found");
        /* TODO
            - Make a system that allows device configuration. 
            - It'll need to have a permanent selector in the GUI to address dynamic device switching when disconnected
        */
      }
    } else {
      // Mac - Create custom virtual input
      midiOutput = new Output("Limidi", true); //
    }
  });

  setupEndpoints();
}

function setupEndpoints() {
  app.get("/Heartbeat", (req, res) => {
    res.send(`Heartbeat at:  ${Date.now()}`);
  });

  app.get("/MidiNote", (req, res) => {
    sendMidiNote(
      req.query.isNoteOn === "true" ? true : false,
      req.query.noteNumber ?? 0,
      req.query.velocity ?? 0
    );
    res.send("MidiNote: " + Date.now() + JSON.stringify(req.query));
  });

  app.get("/ControlChangeInput", (req, res) => {
    sendControlChange(req.query.controlIndex ?? 0, req.query.level ?? 0);
    res.send("ControlChangeInput: " + Date.now() + JSON.stringify(req.query));
  });
}

function closeLimidiServer() {
  server.close();
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
