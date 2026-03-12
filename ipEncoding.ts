const charset = "ABCDEFGHIJKLMNPQRSTUVWYZ123456789";
const ipPortDelimeter = "X";

function encodeNumber(num: number): string {
  const base = charset.length;
  if (num === 0) return charset[0];
  let encoded = "";
  while (num > 0) {
    encoded = charset[num % base] + encoded;
    num = Math.floor(num / base);
  }
  return encoded;
}

function decodeNumber(str: string): number {
  const base = charset.length;
  let num = 0;
  for (let i = 0; i < str.length; i++) {
    num = num * base + charset.indexOf(str[i]);
  }
  return num;
}

export function encodeIpPort(ipPort: string): string {
  const [ipStr, portStr] = ipPort.split(":");
  const ipParts = ipStr.split(".").map((x) => parseInt(x, 10));
  const port = parseInt(portStr, 10);

  if (ipParts.length !== 4) throw new Error("Invalid IPv4 address");

  // Pack IP into 32-bit number
  const ipNum =
    (ipParts[0] << 24) | (ipParts[1] << 16) | (ipParts[2] << 8) | ipParts[3];

  // Encode separately so port can be arbitrary size
  const encodedIp = encodeNumber(ipNum >>> 0); // unsigned
  const encodedPort = encodeNumber(port);

  // Separator for decode
  return `${encodedIp}${ipPortDelimeter}${encodedPort}`;
}

export function decodeIpPort(encoded: string): string {
  const [encodedIp, encodedPort] = encoded.split(ipPortDelimeter);
  const ipNum = decodeNumber(encodedIp);
  const port = decodeNumber(encodedPort);

  // Unpack IP
  const ip = [
    (ipNum >>> 24) & 0xff,
    (ipNum >>> 16) & 0xff,
    (ipNum >>> 8) & 0xff,
    ipNum & 0xff,
  ].join(".");

  return `${ip}:${port}`;
}
