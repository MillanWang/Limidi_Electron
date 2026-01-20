const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("node:path");

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 400,
    height: 400,
    resizable: false,
    maximizable: false,
    minimizable: false,
    fullscreenable: false,
    icon: path.join(__dirname, "assets", "icons", "512x512.png"), // Icon for Linux and window
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      preload: path.join(__dirname, "preload.js"),
      devTools: false,
    },
    autoHideMenuBar: true,
  });

  // and load the index.html of the app.
  mainWindow.loadFile("index.html");
};

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
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
