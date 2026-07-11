import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  // Health
  checkHealth: () => ipcRenderer.invoke('health:check'),

  // Host
  getHosts: (query?: any) => ipcRenderer.invoke('host:list', query),
  getHost: (mac: string) => ipcRenderer.invoke('host:get', mac),
  createHost: (data: any) => ipcRenderer.invoke('host:create', data),
  updateHost: (mac: string, data: any) => ipcRenderer.invoke('host:update', mac, data),
  deleteHost: (mac: string) => ipcRenderer.invoke('host:delete', mac),

  // Blueprint
  getBlueprints: () => ipcRenderer.invoke('blueprint:list'),
  getBlueprint: (id: number) => ipcRenderer.invoke('blueprint:get', id),
  createBlueprint: (data: any) => ipcRenderer.invoke('blueprint:create', data),
  updateBlueprint: (id: number, data: any) => ipcRenderer.invoke('blueprint:update', id, data),
  deleteBlueprint: (id: number) => ipcRenderer.invoke('blueprint:delete', id),

  // Auth
  login: (username: string, password: string) => ipcRenderer.invoke('auth:login', username, password),

  // Window controls
  minimize: () => ipcRenderer.send('window:minimize'),
  maximize: () => ipcRenderer.send('window:maximize'),
  close: () => ipcRenderer.send('window:close'),
});
