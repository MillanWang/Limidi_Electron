import { contextBridge, ipcRenderer } from "electron";

export interface ServerInfo {
  ip?: string;
  port?: number;
  code?: string;
  qrDataUrl?: string;
  error?: string;
  version: string;
}

export type ConnectionState = "connected" | "disconnected";

contextBridge.exposeInMainWorld("limidi", {
  getServerInfo: (): Promise<ServerInfo> => ipcRenderer.invoke("get-server-info"),
  refreshConnection: (): Promise<ServerInfo> => ipcRenderer.invoke("refresh-connection"),
  restartApp: (): void => ipcRenderer.send("restart-app"),
  onServerInfo: (cb: (info: ServerInfo) => void): (() => void) => {
    const handler = (_e: Electron.IpcRendererEvent, info: ServerInfo) => cb(info);
    ipcRenderer.on("server-info", handler);
    return () => ipcRenderer.removeListener("server-info", handler);
  },
  onConnectionState: (cb: (state: ConnectionState) => void): (() => void) => {
    const handler = (_e: Electron.IpcRendererEvent, state: ConnectionState) => cb(state);
    ipcRenderer.on("connection-state", handler);
    return () => ipcRenderer.removeListener("connection-state", handler);
  },
});
