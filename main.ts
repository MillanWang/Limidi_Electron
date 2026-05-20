import { app, BrowserWindow, ipcMain } from "electron";
import path from "node:path";
import QRCode from "qrcode";
import {
  startLiMIDIServer,
  closeLiMIDIServer,
  serverEvents,
  ConnectionState,
} from "./LiMIDIServer";
import { getSubnetIP, findNextAvailablePort } from "./networkingInfo";
import { encodeIpPort } from "./ipEncoding";

const devTools = false;

interface ServerInfo {
  ip?: string;
  port?: number;
  code?: string;
  qrDataUrl?: string;
  error?: string;
  version: string;
}

let mainWindow: BrowserWindow | null = null;
let currentIp: string | undefined;
let currentPort: number | undefined;
let currentQrDataUrl: string | undefined;
let currentError: string | undefined;
let bootPromise: Promise<void> | null = null;
let networkPollTimer: NodeJS.Timeout | null = null;

// A second launch should focus the existing window rather than spin up a
// duplicate process — two instances would each register a virtual MIDI
// output named "LiMIDI" and DAWs would show two indistinguishable ports.
// Store the lock result so whenReady can bail out *before* opening a
// window (app.quit() alone doesn't prevent the ready event from firing).
const gotSingleInstanceLock = app.requestSingleInstanceLock();
if (!gotSingleInstanceLock) {
  app.quit();
}

app.on("second-instance", () => {
  if (!mainWindow) return;
  if (mainWindow.isMinimized()) mainWindow.restore();
  mainWindow.focus();
});

const createWindow = (): void => {
  mainWindow = new BrowserWindow({
    width: 500,
    height: 500,
    resizable: false,
    maximizable: false,
    minimizable: false,
    fullscreenable: false,
    icon: path.join(__dirname, "..", "assets", "icons", "512x512.png"),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
      devTools,
      zoomFactor: 1.0,
    },
    autoHideMenuBar: true,
  });

  mainWindow.webContents.on("before-input-event", (event, input) => {
    if (input.type !== "keyDown") return;
    if (!(input.control || input.meta)) return;
    if (["+", "-", "=", "_", "0"].includes(input.key)) {
      event.preventDefault();
    }
  });

  mainWindow.webContents.setVisualZoomLevelLimits(1, 1);

  mainWindow.loadFile(path.join(__dirname, "..", "index.html"));

  mainWindow.webContents.on("did-finish-load", async () => {
    mainWindow?.webContents.setZoomFactor(1);
    if (bootPromise) await bootPromise;
    mainWindow?.webContents.send("server-info", getServerInfo());
  });

  if (devTools) {
    mainWindow.webContents.openDevTools();
  }
};

function generateQrDataUrl(content: string): Promise<string> {
  return new Promise((resolve, reject) => {
    QRCode.toDataURL(content, { margin: 1, width: 140 }, (err, url) => {
      if (err) reject(err);
      else resolve(url);
    });
  });
}

async function bootServer(): Promise<void> {
  closeLiMIDIServer();
  currentIp = undefined;
  currentPort = undefined;
  currentQrDataUrl = undefined;
  currentError = undefined;

  const ip = getSubnetIP();
  if (!ip) {
    mainWindow?.webContents.send("server-info", getServerInfo());
    return;
  }

  let port: number;
  try {
    port = await findNextAvailablePort(4848, 5050);
  } catch (err) {
    // portfinder rejects when every port in the range is taken (another
    // LiMIDI is running, or unrelated apps are squatting 4848–5050).
    // Without this catch the rejection bubbles up unhandled and the UI
    // gets stuck showing the generic "No network connection" state.
    console.error("Port allocation failed:", err);
    currentError =
      "No available port in 4848–5050. Close conflicting apps and Restart.";
    mainWindow?.webContents.send("server-info", getServerInfo());
    return;
  }

  startLiMIDIServer(port);
  currentIp = ip;
  currentPort = port;

  try {
    currentQrDataUrl = await generateQrDataUrl(`${ip}:${port}`);
  } catch (err) {
    console.error("QR generation failed:", err);
    currentQrDataUrl = undefined;
  }

  mainWindow?.webContents.send("server-info", getServerInfo());
}

function getServerInfo(): ServerInfo {
  const code =
    currentIp && currentPort ? encodeIpPort(`${currentIp}:${currentPort}`) : undefined;
  return {
    ip: currentIp,
    port: currentPort,
    code,
    qrDataUrl: currentQrDataUrl,
    error: currentError,
    version: app.getVersion(),
  };
}

function startNetworkPoll(): void {
  if (networkPollTimer) return;
  networkPollTimer = setInterval(async () => {
    const ip = getSubnetIP();
    if (ip === currentIp) return;
    bootPromise = bootServer();
    await bootPromise;
  }, 5000);
}

app.whenReady().then(async () => {
  // app.quit() above is async; the ready event can still fire on the
  // losing instance and would flash a window if we didn't bail here.
  if (!gotSingleInstanceLock) return;

  createWindow();
  bootPromise = bootServer();
  await bootPromise;
  startNetworkPoll();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", () => {
  if (networkPollTimer) {
    clearInterval(networkPollTimer);
    networkPollTimer = null;
  }
  closeLiMIDIServer();
});

serverEvents.on("state", (state: ConnectionState) => {
  mainWindow?.webContents.send("connection-state", state);
});

ipcMain.handle("get-server-info", async () => {
  if (bootPromise) await bootPromise;
  return getServerInfo();
});

ipcMain.handle("refresh-connection", async () => {
  bootPromise = bootServer();
  await bootPromise;
  return getServerInfo();
});

ipcMain.on("restart-app", () => {
  app.relaunch();
  app.exit(0);
});
