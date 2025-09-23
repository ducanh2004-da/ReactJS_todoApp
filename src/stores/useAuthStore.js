// src/stores/useAuthStore.js
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      token: typeof window !== 'undefined' ? localStorage.getItem('token') : null,
      user: null, // { id, email, firstName, lastName, role }
      setToken: (token) => {
        if (token) localStorage.setItem('token', token);
        else localStorage.removeItem('token');
        set({ token });
      },
      setUser: (user) => set({ user }),
      setAuth: ({ token, user }) => {
        if (token) localStorage.setItem('token', token);
        else localStorage.removeItem('token');
        set({ token: token || null, user: user || null });
      },
      logout: () => {
        localStorage.removeItem('token');
        set({ token: null, user: null });
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ token: state.token, user: state.user }),
    }
  )
);
