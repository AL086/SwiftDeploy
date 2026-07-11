/// <reference types="vite/client" />

interface ElectronAPI {
  checkHealth: () => Promise<any>;
  getHosts: (query?: any) => Promise<any>;
  getHost: (mac: string) => Promise<any>;
  createHost: (data: any) => Promise<any>;
  updateHost: (mac: string, data: any) => Promise<any>;
  deleteHost: (mac: string) => Promise<any>;
  getBlueprints: () => Promise<any>;
  getBlueprint: (id: number) => Promise<any>;
  createBlueprint: (data: any) => Promise<any>;
  updateBlueprint: (id: number, data: any) => Promise<any>;
  deleteBlueprint: (id: number) => Promise<any>;
  login: (username: string, password: string) => Promise<any>;
  minimize: () => void;
  maximize: () => void;
  close: () => void;
}

interface Window {
  electronAPI?: ElectronAPI;
}
