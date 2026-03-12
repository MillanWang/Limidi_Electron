import QRCode from "qrcode";
import { getSubnetIP, findNextAvailablePort } from "./networkingInfo";
import { replaceElementText } from "./utils";
import { encodeIpPort } from "./ipEncoding";
import { ipcRenderer } from "electron";
import { startLiMIDIServer, closeLiMIDIServer } from "./LiMIDIServer";

declare global {
  interface Window {
    restartApp: () => void;
  }
}

window.restartApp = () => {
  ipcRenderer.send("restart-app");
};

const setupRestartButton = (): void => {
  const restartButton = document.getElementById("restart-button");
  if (restartButton) {
    restartButton.addEventListener("click", () => {
      if (window.restartApp) {
        window.restartApp();
      }
    });
  }
};

const onContentLoaded = async (): Promise<void> => {
  setupRestartButton();
  const { ip, port } = await tryGetServerInfo();
  if (!ip || !port) {
    setOfflineMessage();
    return;
  }
  onOnlineHandler();
};

const onOnlineHandler = async (): Promise<void> => {
  const { ip, port } = await tryGetServerInfo();
  const baseAddress = `${ip}:${port}`;
  const encodedAddress = encodeIpPort(baseAddress);

  startLiMIDIServer(port);
  replaceElementText(`connection-code`, `Code: ${encodedAddress}`);
  setQrCode(baseAddress);
};

const onOfflineHandler = async (): Promise<void> => {
  closeLiMIDIServer();
  setQrCode("");
  setOfflineMessage();
};

const setOfflineMessage = (): void => {
  replaceElementText(`connection-code`, "No internet connection");
};

const tryGetServerInfo = async (): Promise<{ ip: string | undefined; port: number }> => {
  return {
    ip: getSubnetIP(),
    port: await findNextAvailablePort(4848, 5050),
  };
};

function setQrCode(codeContent: string): void {
  const canvas = document.getElementById("canvas") as HTMLCanvasElement | null;
  if (!canvas) return;
  if (codeContent) {
    canvas.removeAttribute("hidden");
    QRCode.toCanvas(canvas, codeContent, function (error: Error | null | undefined) {
      if (error) replaceElementText("qr-error", "Could not generate QR code");
    });
  } else {
    canvas.setAttribute("hidden", "true");
  }
}

window.addEventListener("DOMContentLoaded", onContentLoaded);
window.addEventListener("online", onOnlineHandler);
window.addEventListener("offline", onOfflineHandler);
