import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

const authApi = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
});

export const useAuthStore = create(persist((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  login: async (email, password) => {
    const { data } = await authApi.post('/auth/login', { email, password });
    set({ user: data.user, accessToken: data.accessToken, refreshToken: data.refreshToken });
    return data.user;
  },
  logout: () => set({ user: null, accessToken: null, refreshToken: null })
}), { name: 'pulsehr-auth' }));
