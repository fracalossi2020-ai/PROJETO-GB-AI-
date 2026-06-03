import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  isAuth: boolean;
  setUser: (user: User | null) => void;
  login: (user: User, token: string) => void;
  logout: () => void;
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuth: false,
      setUser: (user) => set({ user, isAuth: !!user }),
      login: (user, token) => {
        localStorage.setItem('token', token);
        set({ user, isAuth: true });
      },
      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, isAuth: false });
      },
    }),
    { name: 'gbai-auth' }
  )
);
