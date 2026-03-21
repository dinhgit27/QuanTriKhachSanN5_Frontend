import { create } from 'zustand';

// Lưu trữ token, user và permissions. Cung cấp actions: setAuth, clearAuth [cite: 220]
export const useAdminAuthStore = create((set) => ({
  token: localStorage.getItem('token') || null,
  user: JSON.parse(localStorage.getItem('user')) || null,
  permissions: [],
  
  setAuth: (token, user, permissions) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    set({ token, user, permissions });
  },
  clearAuth: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    set({ token: null, user: null, permissions: [] });
  }
}));