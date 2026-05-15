import os from "os";
import portfinder from "portfinder";

// Interfaces whose IPs are routable on the host but NOT reachable from a phone
// on the same Wi-Fi: VPN tunnels (utun on macOS, wg* for WireGuard, tailscale0),
// Docker/VM bridges, and virtualization host-only networks. Returning one of
// these as the QR-encoded address gives a connection that silently fails.
const DEPRIORITISED_IFACE_PREFIXES = [
  "utun",
  "bridge",
  "vmnet",
  "vbox",
  "docker",
  "tailscale",
  "wg",
];

function isPrivateRange(ip: string): boolean {
  if (ip.startsWith("192.168.")) return true;
  if (ip.startsWith("10.")) return true;
  if (ip.startsWith("172.")) {
    const second = parseInt(ip.split(".")[1] ?? "", 10);
    return second >= 16 && second <= 31;
  }
  return false;
}

// Scoring (rather than a single hard rule) is needed because the IP range and
// the interface name are independent signals and can disagree: e.g. Docker's
// bridge holds a 192.168.x.x address that looks like a LAN IP but is unreachable
// from the phone, while a real Wi-Fi adapter on a corporate LAN may sit in 10.x.
// Combining the two as scores lets a "bad name, good-looking IP" lose to a
// "good name, less-preferred range," which is the outcome we want. The -100
// interface penalty is sized to always outweigh any range bonus.
function scoreCandidate(ifaceName: string, ip: string): number {
  let score = 0;
  if (ip.startsWith("192.168.")) score += 30;
  else if (ip.startsWith("10.")) score += 20;
  else if (isPrivateRange(ip)) score += 10;

  const lowered = ifaceName.toLowerCase();
  if (DEPRIORITISED_IFACE_PREFIXES.some((p) => lowered.startsWith(p))) {
    score -= 100;
  }
  return score;
}

export function getSubnetIP(): string | undefined {
  const networkInterfaces = os.networkInterfaces();
  let bestIp: string | undefined;
  let bestScore = -Infinity;

  for (const ifaceName of Object.keys(networkInterfaces)) {
    const addresses = networkInterfaces[ifaceName];
    if (!addresses) continue;
    for (const address of addresses) {
      if (address.family !== "IPv4" || address.internal) continue;
      const score = scoreCandidate(ifaceName, address.address);
      if (score > bestScore) {
        bestScore = score;
        bestIp = address.address;
      }
    }
  }
  return bestIp;
}

export function findNextAvailablePort(startingPort: number, stopPort: number): Promise<number> {
  return portfinder.getPortPromise({
    port: startingPort,
    stopPort,
  });
}
