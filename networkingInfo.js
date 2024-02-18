const os = require("os");
const portfinder = require("portfinder");

function getSubnetIP() {
  const networkInterfaces = os.networkInterfaces();
  for (const iface of Object.keys(networkInterfaces)) {
    for (const address of networkInterfaces[iface]) {
      if (address.family === "IPv4" && !address.internal) {
        return address.address;
      }
    }
  }
}

function findNextAvailablePort(startingPort, maxAttempts) {
  return portfinder.getPortPromise({
    port: startingPort, // minimum port
    stopPort: maxAttempts, // maximum port
  });
}

module.exports = {
  getSubnetIP,
  findNextAvailablePort,
};
