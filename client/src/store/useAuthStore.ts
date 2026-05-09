import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  fullName: string;
  username?: string;
  email: string;
  profileImage?: string;
  subscriptionPlan: string;
  role: string;
  resumeCount: number;
  atsAverageScore: number;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => {
        localStorage.setItem('token', token);
        set({ user, token, isAuthenticated: true });
      },
      logout: () => {
        localStorage.removeItem('token');
        set({ user: null, token: null, isAuthenticated: false });
      },
      updateUser: (userData) => {
        const currentUser = get().user;
        if (currentUser) {
          set({ user: { ...currentUser, ...userData } });
        }
      },
      checkAuth: () => {
        const { token, user } = get();
        if (token && user) {
          set({ isAuthenticated: true });
        } else {
          set({ isAuthenticated: false });
        }
      }
    }),
    {
      name: 'hirestream-auth',
    }
  )
);
