const QRCode = require("qrcode");
const { getSubnetIP, findNextAvailablePort } = require("./networkingInfo");

const { startLimidiServer } = require("./limidiServer");

window.addEventListener("DOMContentLoaded", async () => {
    const ip = getSubnetIP();
    const port = await findNextAvailablePort(4848, 5050);
    const baseAddress = `${ip}:${port}`;

    startLimidiServer(port);
    replaceElementText(`ip-address`, baseAddress);
    setQrCode(baseAddress);
});

function replaceElementText(selector, text) {
    const element = document.getElementById(selector);
    if (element) element.innerText = text;
}

function setQrCode(codeContent) {
    const canvas = document.getElementById("canvas");
    QRCode.toCanvas(canvas, codeContent, function (error) {
        if (error) replaceElementText("qr-error", "Could not generate QR code");
    });
}
