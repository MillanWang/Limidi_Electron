function setText(id: string, text: string): void {
  const el = document.getElementById(id);
  if (el) el.innerText = text;
}

function setStatusDot(connected: boolean): void {
  const el = document.getElementById("status-dot");
  if (!el) return;
  el.classList.toggle("connected", connected);
  el.classList.toggle("disconnected", !connected);
}

function setQrSrc(src: string): void {
  const img = document.getElementById("qr") as HTMLImageElement | null;
  if (!img) return;
  if (src) {
    img.removeAttribute("hidden");
    img.src = src;
  } else {
    img.setAttribute("hidden", "true");
    img.removeAttribute("src");
  }
}

function applyServerInfo(info: ServerInfo): void {
  setText("version", `v${info.version}`);
  setText("qr-error", "");

  if (!info.code || !info.qrDataUrl) {
    setText("connection-code", "No network connection");
    setQrSrc("");
    return;
  }

  setText("connection-code", `Code: ${info.code}`);
  setQrSrc(info.qrDataUrl);
}

window.addEventListener("DOMContentLoaded", async () => {
  const restartButton = document.getElementById("restart-button");
  restartButton?.addEventListener("click", () => window.limidi.restartApp());

  window.limidi.onConnectionState((state) => {
    const connected = state === "connected";
    setText("connection-status", connected ? "Connected" : "Disconnected");
    setStatusDot(connected);
  });

  window.limidi.onServerInfo((info) => {
    applyServerInfo(info);
  });

  const info = await window.limidi.getServerInfo();
  applyServerInfo(info);
});
