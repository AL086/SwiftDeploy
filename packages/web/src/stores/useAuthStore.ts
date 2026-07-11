import { create } from 'zustand';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
}

interface AuthState {
  loggedIn: boolean;
  user: User | null;
  login: (username: string, token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  loggedIn: false,
  user: null,
  login: (username, token, user) => set({ loggedIn: true, user }),
  logout: () => set({ loggedIn: false, user: null }),
}));
