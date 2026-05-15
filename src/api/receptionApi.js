import axiosClient from './axios';

export const receptionApi = {
    getServicesList: () => axiosClient.get('/Reception/services-list'),
    getAvailableRooms: () => axiosClient.get('/Reception/available-rooms'),
    getEquipmentsList: () => axiosClient.get('/Reception/equipments-list'),
    checkIn: (bookingId, roomId) => axiosClient.post(`/Reception/checkin/${bookingId}`, roomId, {
        headers: { 'Content-Type': 'application/json' }
    }),
    orderService: (bookingId, data) => axiosClient.post(`/Reception/order-service/${bookingId}`, data),
    reportDamage: (bookingId, data) => axiosClient.post(`/Reception/report-damage/${bookingId}`, data),
    addDeposit: (bookingId, data) => axiosClient.post(`/Reception/deposit/${bookingId}`, data),
};
