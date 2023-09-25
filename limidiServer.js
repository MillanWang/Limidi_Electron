const express = require("express");
const { Output } = require('easymidi');

const app = express();

let virtualOutput;
function startLimidiServer(port) {
    app.listen(port, "0.0.0.0", () => {
        virtualOutput = new Output('Limidi', true);
    })

    setupEndpoints();
}

function setupEndpoints() {
    app.get("/Heartbeat", (req, res) => {
        res.send(`Heartbeat at:  ${Date.now()}`)
    });

    app.get("/MidiNote", (req, res) => {
        sendMidiNote(
            (req.query.isNoteOn === "true") ? true : false,
            req.query.noteNumber ?? 0,
            req.query.velocity ?? 0
        )
        res.send("MidiNote: " + Date.now() + JSON.stringify(req.query))
    });

    app.get("/ControlChangeInput", (req, res) => {
        sendControlChange(
            req.query.controlIndex ?? 0,
            req.query.level ?? 0,
        )
        res.send("ControlChangeInput: " + Date.now() + JSON.stringify(req.query))
    });
}



function sendMidiNote(isNoteOn, noteNumber, velocity,) {
    virtualOutput.send(isNoteOn ? "noteon" : "noteoff", {
        note: noteNumber,
        velocity: isNoteOn ? velocity : 0,
        channel: 0
    })
}

function sendControlChange(controlIndex, level,) {
    virtualOutput.send("cc", {
        controller: controlIndex,
        value: level,
        channel: 0
    })
}

module.exports = {
    startLimidiServer
}