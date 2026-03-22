import axiosClient from '../api/axios'; // Nhúng cấu hình axios ở bước trước vào đây

// Khai báo authAPI chứa các hàm liên quan đến đăng nhập, đăng ký
export const authAPI = {
    // Hàm gọi API Login
    login: (data) => {
        // Gọi xuống endpoint /api/Auth/login của Backend
        return axiosClient.post('/Auth/login', data);
    },
    
    // Hàm gọi API Register (để dành cho Tab Đăng ký của bạn)
    register: (data) => {
        return axiosClient.post('/Auth/register', data);
    }
};