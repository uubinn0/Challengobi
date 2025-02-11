import { create } from 'zustand';

interface User {
  id: string;
  nickname: string;
  profileImage: string;
}

interface AuthState {
  isLoggedIn: boolean;
  user: User | null;
  setUser: (user: User | null) => void;
  setIsLoggedIn: (isLoggedIn: boolean) => void;
}

export const useAuthStore = create<AuthState>()((set: any) => ({
  isLoggedIn: false,
  user: null,
  setUser: (user: User | null) => set({ user }),
  setIsLoggedIn: (isLoggedIn: boolean) => set({ isLoggedIn }),
})); 