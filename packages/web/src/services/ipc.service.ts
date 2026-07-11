const api = window.electronAPI;

export const ipcService = {
  checkHealth: () => api?.checkHealth() ?? Promise.reject('No Electron API'),

  getHosts: (query?: any) => api?.getHosts(query) ?? Promise.reject('No Electron API'),
  getHost: (mac: string) => api?.getHost(mac) ?? Promise.reject('No Electron API'),
  createHost: (data: any) => api?.createHost(data) ?? Promise.reject('No Electron API'),
  updateHost: (mac: string, data: any) => api?.updateHost(mac, data) ?? Promise.reject('No Electron API'),
  deleteHost: (mac: string) => api?.deleteHost(mac) ?? Promise.reject('No Electron API'),

  getBlueprints: () => api?.getBlueprints() ?? Promise.reject('No Electron API'),
  getBlueprint: (id: number) => api?.getBlueprint(id) ?? Promise.reject('No Electron API'),
  createBlueprint: (data: any) => api?.createBlueprint(data) ?? Promise.reject('No Electron API'),
  updateBlueprint: (id: number, data: any) => api?.updateBlueprint(id, data) ?? Promise.reject('No Electron API'),
  deleteBlueprint: (id: number) => api?.deleteBlueprint(id) ?? Promise.reject('No Electron API'),

  login: (username: string, password: string) => api?.login(username, password) ?? Promise.reject('No Electron API'),

  minimize: () => api?.minimize(),
  maximize: () => api?.maximize(),
  close: () => api?.close(),
};
