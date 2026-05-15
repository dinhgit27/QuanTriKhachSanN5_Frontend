import axiosClient from './axios';

export const bookingApi = {
    getAll: () => axiosClient.get('/Bookings'),
    getArrivals: () => axiosClient.get('/Bookings/arrivals'),
    getInHouse: () => axiosClient.get('/Bookings/in-house'),
    getById: (id) => axiosClient.get(`/Bookings/${id}`),
    updateStatus: (id, status) => axiosClient.put(`/Bookings/${id}/status`, { status }),
    create: (data) => axiosClient.post('/Bookings/create', data),
    getAvailableRooms: (data) => axiosClient.post('/Bookings/available-rooms', data),
};
