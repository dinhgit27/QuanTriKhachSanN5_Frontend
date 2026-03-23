import axiosClient from './axios';

export const authAPI = {
    // Hàm gọi API đăng nhập xuống Backend
    login: (credentials) => {
        // credentials sẽ chứa { email, password }
        return axiosClient.post('/Auth/login', credentials);
    }
};