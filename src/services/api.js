import axios from 'axios';

// Cấu hình base URL cho API backend
const API_BASE_URL = 'https://localhost:5070/api';

// Lưu ý: Backend đang chạy trên cổng 5070
// Nếu backend chạy trên cổng khác, hãy cập nhật URL này
// Nếu backend không hoạt động, ứng dụng sẽ tự động sử dụng dữ liệu mẫu
// Lỗi 500 có thể do backend chưa cấu hình đúng hoặc database chưa kết nối

// Tạo instance axios với cấu hình mặc định
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Thêm interceptor để tự động thêm token vào headers
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

// Xử lý lỗi response
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token hết hạn hoặc không hợp lệ
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Room API
export const roomApi = {
  // Lấy danh sách phòng
  getRooms: () => api.get('/rooms'),
  
  // Lấy phòng theo ID
  getRoomById: (id) => api.get(`/rooms/${id}`),
  
  // Cập nhật trạng thái phòng
  updateRoomStatus: (id, status) => api.put(`/rooms/${id}/status`, status),
  
  // Lấy danh sách loại phòng
  getRoomTypes: () => api.get('/roomtypes'),
  
  // Tìm phòng trống theo yêu cầu
  searchAvailableRooms: (params) => api.post('/bookings/search-room', params),
  
  // Lấy phòng vật lý trống cho lễ tân
  getAvailablePhysicalRooms: (roomTypeId, checkIn, checkOut) => 
    api.get(`/bookings/available-physical-rooms?roomTypeId=${roomTypeId}&checkIn=${checkIn}&checkOut=${checkOut}`)
};

// Booking API
export const bookingApi = {
  // Lấy danh sách booking
  getBookings: () => api.get('/bookings'),
  
  // Lấy booking theo ID
  getBookingById: (id) => api.get(`/bookings/${id}`),
  
  // Tạo booking mới
  createBooking: (bookingData) => api.post('/bookings', bookingData),
  
  // Cập nhật booking
  updateBooking: (id, bookingData) => api.put(`/bookings/${id}`, bookingData),
  
  // Hủy booking
  cancelBooking: (id) => api.delete(`/bookings/${id}`),
  
  // Nhận phòng
  checkIn: (bookingId, roomId) => api.post(`/reception/checkin/${bookingId}`, roomId),
  
  // Trả phòng
  checkOut: (bookingId) => api.get(`/reception/checkout/${bookingId}`),
  
  // Tạo invoice
  generateInvoice: (bookingId) => api.post('/checkout/generate-invoice', { bookingId }),
  
  // Thanh toán
  processPayment: (paymentData) => api.post('/checkout/process-payment', paymentData)
};

// Service API
export const serviceApi = {
  // Lấy danh sách dịch vụ
  getServices: () => api.get('/services'),
  
  // Lấy dịch vụ theo ID
  getServiceById: (id) => api.get(`/services/${id}`),
  
  // Đặt dịch vụ
  orderService: (serviceData) => api.post('/reception/services', serviceData),
  
  // Báo hỏng đồ
  reportDamage: (damageData) => api.post('/reception/damages', damageData),
  
  // Lấy danh sách đơn dịch vụ
  getOrderServices: () => api.get('/orderservices'),
  
  // Cập nhật trạng thái đơn dịch vụ
  updateOrderStatus: (id, status) => api.put(`/orderservices/${id}/status`, { status }),
  
  // Hủy đơn dịch vụ
  cancelOrder: (id) => api.delete(`/orderservices/${id}`)
};

// User API
export const userApi = {
  // Lấy thông tin người dùng
  getCurrentUser: () => api.get('/users/current'),
  
  // Lấy danh sách người dùng
  getUsers: () => api.get('/users'),
  
  // Cập nhật người dùng
  updateUser: (id, userData) => api.put(`/users/${id}`, userData)
};

// Room Inventory API
export const roomInventoryApi = {
  // Lấy danh sách tiện nghi
  getAmenities: () => api.get('/roominventory/amenities'),
  
  // Lấy vật tư trong phòng
  getRoomInventory: (roomId) => api.get(`/roominventory/rooms/${roomId}/inventory`),
  
  // Cập nhật trạng thái phòng
  updateRoomStatus: (roomId, status) => api.put(`/roominventory/rooms/${roomId}/status`, status)
};

export default api;