import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:5070/api",
});

// Gắn token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export const invoiceAPI = {
    preview: (bookingId) => axios.get(`${API}/preview/${bookingId}`),
    checkout: (bookingId) => axios.post(`${API}/checkout/${bookingId}`)
};

// const invoiceAPI = {
//     // 🔍 Xem trước hóa đơn
//     preview: (bookingId) => {
//         return api.get(`/Invoices/preview/${bookingId}`);
//     },

//     // 🧾 Checkout + tạo hóa đơn
//     checkout: (bookingId) => {
//         return api.post(`/Invoices/checkout/${bookingId}`);
//     },
// };

export default invoiceAPI;