const QRCode = require("qrcode");
const { getSubnetIP, findNextAvailablePort } = require("./networkingInfo");
const { replaceElementText } = require("./utils");
const { encodeIpPort } = require("./ipEncoding");
const { ipcRenderer } = require("electron");

const { startLimidiServer, closeLimidiServer } = require("./limidiServer");

window.restartApp = () => {
  ipcRenderer.send("restart-app");
};

const setupRestartButton = () => {
  const restartButton = document.getElementById("restart-button");
  if (restartButton) {
    restartButton.addEventListener("click", () => {
      if (window.restartApp) {
        window.restartApp();
      }
    });
  }
};

const onContentLoaded = async () => {
  setupRestartButton();
  const { ip, port } = await tryGetServerInfo();
  if (!ip || !port) {
    setOfflineMessage();
    return;
  }
  onOnlineHandler();
};

const onOnlineHandler = async () => {
  const { ip, port } = await tryGetServerInfo();
  const baseAddress = `${ip}:${port}`;
  const encodedAddress = encodeIpPort(baseAddress);

  startLimidiServer(port);
  replaceElementText(`connection-code`, `Code: ${encodedAddress}`);
  setQrCode(baseAddress);
};

const onOfflineHandler = async () => {
  closeLimidiServer();
  setQrCode("");
  setOfflineMessage();
};

const setOfflineMessage = () => {
  replaceElementText(`connection-code`, "No internet connection");
};

const tryGetServerInfo = async () => {
  return {
    ip: getSubnetIP(),
    port: await findNextAvailablePort(4848, 5050),
  };
};

function setQrCode(codeContent) {
  const canvas = document.getElementById("canvas");
  if (codeContent) {
    canvas.removeAttribute("hidden");
    QRCode.toCanvas(canvas, codeContent, function (error) {
      if (error) replaceElementText("qr-error", "Could not generate QR code");
    });
  } else {
    canvas.setAttribute("hidden", true);
  }
}

window.addEventListener("DOMContentLoaded", onContentLoaded);
window.addEventListener("online", onOnlineHandler);
window.addEventListener("offline", onOfflineHandler);
