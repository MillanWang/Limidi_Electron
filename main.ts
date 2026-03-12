import { app, BrowserWindow, ipcMain } from "electron";
import path from "node:path";

const devTools = false;

const createWindow = (): void => {
  const mainWindow = new BrowserWindow({
    width: 400,
    height: 400,
    resizable: false,
    maximizable: false,
    minimizable: false,
    fullscreenable: false,
    // icon: path.join(__dirname, "..", "assets", "icons", "512x512.png"),
    icon: path.join(__dirname, "assets", "icons", "512x512.png"),
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, "preload.js"),
      devTools,
    },
    autoHideMenuBar: true,
  });

  mainWindow.loadFile(path.join(__dirname, "..", "index.html"));

  if (devTools) {
    mainWindow.webContents.openDevTools();
  }
};

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

ipcMain.on("restart-app", () => {
  app.relaunch();
  app.exit(0);
});
