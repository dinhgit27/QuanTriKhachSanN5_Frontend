import axios from 'axios';

// 1. Khởi tạo cấu hình axios cơ bản
const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL, // Lấy đường dẫn từ file .env
    headers: { 'Content-Type': 'application/json' },
});

// 2. Request Interceptor: Tự động gắn Token trước khi gửi đi
axiosClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`; // Nhớ có dấu cách sau Bearer
    }
    return config;
});

// 3. Response Interceptor: Bắt lỗi trả về từ Backend
axiosClient.interceptors.response.use(
    (response) => {
        return response; // Trả về data nếu thành công
    },
    (error) => {
        // Nếu lỗi 401 (Hết hạn Token hoặc chưa đăng nhập), có thể code tự động văng ra trang login ở đây
        if (error.response && error.response.status === 401) {
             localStorage.removeItem('token');
             window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default axiosClient;