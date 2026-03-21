import axios from 'axios';
import { API_CONFIG } from './config';

// Tạo instance axios với cấu hình mặc định
const api = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor để thêm token vào header
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor để xử lý response
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token hết hạn, redirect về login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// API functions cho authentication
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getProfile: () => api.get('/auth/profile'),
};

// API functions cho quản lý phòng
export const roomAPI = {
  getAll: (params) => api.get('/rooms', { params }),
  getById: (id) => api.get(`/rooms/${id}`),
  create: (roomData) => api.post('/rooms', roomData),
  update: (id, roomData) => api.put(`/rooms/${id}`, roomData),
  delete: (id) => api.delete(`/rooms/${id}`),
  updateStatus: (id, status) => api.patch(`/rooms/${id}/status`, { status }),
};

// API functions cho quản lý đặt phòng
export const bookingAPI = {
  getAll: (params) => api.get('/bookings', { params }),
  getById: (id) => api.get(`/bookings/${id}`),
  create: (bookingData) => api.post('/bookings', bookingData),
  update: (id, bookingData) => api.put(`/bookings/${id}`, bookingData),
  delete: (id) => api.delete(`/bookings/${id}`),
  confirm: (id) => api.patch(`/bookings/${id}/confirm`),
  cancel: (id) => api.patch(`/bookings/${id}/cancel`),
  getUserBookings: () => api.get('/bookings/user'),
};

// API functions cho quản lý khách hàng
export const customerAPI = {
  getAll: (params) => api.get('/customers', { params }),
  getById: (id) => api.get(`/customers/${id}`),
  create: (customerData) => api.post('/customers', customerData),
  update: (id, customerData) => api.put(`/customers/${id}`, customerData),
  delete: (id) => api.delete(`/customers/${id}`),
  updateStatus: (id, status) => api.patch(`/customers/${id}/status`, { status }),
};

// API functions cho quản lý nhân viên
export const staffAPI = {
  getAll: (params) => api.get('/staff', { params }),
  getById: (id) => api.get(`/staff/${id}`),
  create: (staffData) => api.post('/staff', staffData),
  update: (id, staffData) => api.put(`/staff/${id}`, staffData),
  delete: (id) => api.delete(`/staff/${id}`),
  updateStatus: (id, status) => api.patch(`/staff/${id}/status`, { status }),
};

// API functions cho báo cáo
export const reportAPI = {
  getRevenue: (params) => api.get('/reports/revenue', { params }),
  getRoomStats: (params) => api.get('/reports/rooms', { params }),
  getCustomerStats: (params) => api.get('/reports/customers', { params }),
  exportReport: (type, params) => api.get(`/reports/export/${type}`, {
    params,
    responseType: 'blob'
  }),
};

// API functions cho cài đặt
export const settingsAPI = {
  getAll: () => api.get('/settings'),
  update: (settingsData) => api.put('/settings', settingsData),
  getSystemInfo: () => api.get('/settings/system'),
};

// Export instance axios để sử dụng trực tiếp nếu cần
export default api;