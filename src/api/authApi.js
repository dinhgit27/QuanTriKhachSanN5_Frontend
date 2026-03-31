import axiosClient from './axios';

export const authAPI = {
    // Hàm gọi API đăng nhập xuống Backend
    login: (credentials) => {
        // credentials sẽ chứa { email, password }
        return axiosClient.post('/Auth/login', credentials);
    },
    
    // THÊM HÀM ĐĂNG KÝ VÀO ĐÂY NÈ ĐỈNH 🚀
    register: (data) => {
        // data sẽ chứa { fullName, email, phoneNumber, password, confirmPassword }
        return axiosClient.post('/Auth/register', data);
    }
};