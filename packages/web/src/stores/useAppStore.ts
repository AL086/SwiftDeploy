import { create } from 'zustand';

interface AppState {
  currentPage: number;
  connected: boolean;
  serverVersion: string;
  setCurrentPage: (page: number) => void;
  setConnected: (connected: boolean, version?: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  currentPage: 0,
  connected: false,
  serverVersion: '',
  setCurrentPage: (page) => set({ currentPage: page }),
  setConnected: (connected, version = '') =>
    set({ connected, serverVersion: version }),
}));
