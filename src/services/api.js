import axiosClient from '../api/axios';

export const authAPI = {
    login: (data) => axiosClient.post('/Auth/login', data),
    register: (data) => axiosClient.post('/Auth/register', data),
};

// ĐÂY LÀ THỨ MÀ RoomManagement.jsx ĐANG ĐÒI NÈ NÍ
export const roomAPI = {
    getAll: () => axiosClient.get('/Rooms'),
    create: (data) => axiosClient.post('/Rooms', data),
    // Thêm các hàm khác nếu cần...
};

// Cho cả BookingManagement nữa nhé
export const bookingAPI = {
    getAll: () => axiosClient.get('/Bookings'),
};