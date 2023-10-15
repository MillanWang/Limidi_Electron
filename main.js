const { app, BrowserWindow } = require("electron");
const path = require("node:path");

const createWindow = () => {
    // Create the browser window.
    const mainWindow = new BrowserWindow({
        maxWidth: 800,
        maxHeight: 600,
        minWidth: 400,
        minHeight: 400,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            preload: path.join(__dirname, "preload.js"),
        },
        autoHideMenuBar: true,
    });

    // and load the index.html of the app.
    mainWindow.loadFile("index.html");

    // Open the DevTools.
    mainWindow.webContents.openDevTools();
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
