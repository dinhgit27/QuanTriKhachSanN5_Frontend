import axios from 'axios';
import { useAdminAuthStore } from '../store/adminAuthStore';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://localhost:7020/api', // Đọc từ biến môi trường [cite: 106, 168]
  headers: { 'Content-Type': 'application/json' },
});

// Request Interceptor: Tự động đính kèm JWT Token [cite: 157, 172-176]
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response Interceptor: Xử lý lỗi tập trung [cite: 178, 717-719]
axiosClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      useAdminAuthStore.getState().clearAuth();
      window.location.href = '/login'; // Chuyển hướng về login khi hết hạn [cite: 719]
    }
    return Promise.reject(err);
  }
);

export default axiosClient;