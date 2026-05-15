interface ServerInfo {
  ip?: string;
  port?: number;
  code?: string;
  qrDataUrl?: string;
  version: string;
}

type ConnectionState = "connected" | "disconnected";

interface LiMIDIAPI {
  getServerInfo(): Promise<ServerInfo>;
  refreshConnection(): Promise<ServerInfo>;
  restartApp(): void;
  onServerInfo(cb: (info: ServerInfo) => void): () => void;
  onConnectionState(cb: (state: ConnectionState) => void): () => void;
}

interface Window {
  limidi: LiMIDIAPI;
}
