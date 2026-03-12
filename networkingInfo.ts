import os from "os";
import portfinder from "portfinder";

export function getSubnetIP(): string | undefined {
  const networkInterfaces = os.networkInterfaces();
  for (const iface of Object.keys(networkInterfaces)) {
    const addresses = networkInterfaces[iface];
    if (!addresses) continue;
    for (const address of addresses) {
      if (address.family === "IPv4" && !address.internal) {
        return address.address;
      }
    }
  }
  return undefined;
}

export function findNextAvailablePort(startingPort: number, maxAttempts: number): Promise<number> {
  return portfinder.getPortPromise({
    port: startingPort,
    stopPort: maxAttempts,
  });
}
