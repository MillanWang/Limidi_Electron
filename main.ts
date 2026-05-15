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
  version: string;
}

let mainWindow: BrowserWindow | null = null;
let currentIp: string | undefined;
let currentPort: number | undefined;
let currentQrDataUrl: string | undefined;
let bootPromise: Promise<void> | null = null;
let networkPollTimer: NodeJS.Timeout | null = null;

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
    },
    autoHideMenuBar: true,
  });

  mainWindow.loadFile(path.join(__dirname, "..", "index.html"));

  mainWindow.webContents.on("did-finish-load", async () => {
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
  const ip = getSubnetIP();
  if (!ip) {
    currentIp = undefined;
    currentPort = undefined;
    currentQrDataUrl = undefined;
  } else {
    const port = await findNextAvailablePort(4848, 5050);
    startLiMIDIServer(port);
    currentIp = ip;
    currentPort = port;
    try {
      currentQrDataUrl = await generateQrDataUrl(`${ip}:${port}`);
    } catch (err) {
      console.error("QR generation failed:", err);
      currentQrDataUrl = undefined;
    }
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
