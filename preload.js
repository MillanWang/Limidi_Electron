const QRCode = require("qrcode");
const { getSubnetIP, findNextAvailablePort } = require("./networkingInfo");
const { replaceElementText } = require("./utils");

const { startLimidiServer, closeLimidiServer } = require("./limidiServer");

const onContentLoaded = async () => {
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

  startLimidiServer(port);
  replaceElementText(`ip-address`, `IP Address: ${baseAddress}`);
  setQrCode(baseAddress);
};

const onOfflineHandler = async () => {
  closeLimidiServer();
  setQrCode("");
  setOfflineMessage();
};

const setOfflineMessage = () => {
  replaceElementText(`ip-address`, "No internet connection");
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
