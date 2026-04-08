// Mock data cho Audit Logs (vì backend chưa có)
const MOCK_AUDIT_LOGS = [
  {
    id: 1,
    timestamp: '2026-04-03T20:45:12',
    userId: 'USR001',
    userName: 'Admin',
    email: 'admin@hotel.com',
    action: 'Sửa',
    actionType: 'UPDATE',
    module: 'Nhân viên & Quyền',
    objectName: 'Ngô Văn A',
    description: 'Thay đổi chức vụ từ "Receptionist" sang "Manager"',
    oldValue: { role: 'Receptionist', status: 'Active' },
    newValue: { role: 'Manager', status: 'Active' },
    ipAddress: '192.168.1.100',
  },
  {
    id: 2,
    timestamp: '2026-04-03T19:30:45',
    userId: 'USR002',
    userName: 'Manager',
    email: 'manager@hotel.com',
    action: 'Thêm',
    actionType: 'CREATE',
    module: 'Quản lý Phòng',
    objectName: 'Phòng 101',
    description: 'Thêm phòng mới với loại Deluxe, giá 950.000đ',
    oldValue: null,
    newValue: { roomNumber: '101', type: 'Deluxe', price: '950,000đ', status: 'Available' },
    ipAddress: '192.168.1.105',
  },
  {
    id: 3,
    timestamp: '2026-04-03T18:15:22',
    userId: 'USR001',
    userName: 'Admin',
    email: 'admin@hotel.com',
    action: 'Xóa',
    actionType: 'DELETE',
    module: 'Kho Vật Tư',
    objectName: 'Khăn Tắm - LOT002',
    description: 'Xóa lô hàng khăn tắm (Số lượng: 100 chiếc, Giá: 45.000đ/chiếc)',
    oldValue: { quantity: 100, price: '45,000đ/chiếc', status: 'Active' },
    newValue: null,
    ipAddress: '192.168.1.100',
  },
  {
    id: 4,
    timestamp: '2026-04-03T17:00:33',
    userId: 'USR003',
    userName: 'Receptionist',
    email: 'receptionist@hotel.com',
    action: 'Đăng nhập',
    actionType: 'LOGIN',
    module: 'Hệ thống',
    objectName: 'Tài khoản: receptionist@hotel.com',
    description: 'Đăng nhập vào hệ thống quản lý khách sạn',
    oldValue: null,
    newValue: { loginTime: '2026-04-03 17:00:33', device: 'Chrome/Windows' },
    ipAddress: '192.168.1.110',
  },
  {
    id: 5,
    timestamp: '2026-04-03T16:45:00',
    userId: 'USR002',
    userName: 'Manager',
    email: 'manager@hotel.com',
    action: 'Check-in',
    actionType: 'CHECKIN',
    module: 'Đặt Phòng',
    objectName: 'Đặt phòng #BK12345',
    description: 'Check-in khách Nguyễn Văn B vào Phòng 201',
    oldValue: { status: 'Confirmed' },
    newValue: { status: 'Checked-in', checkInTime: '2026-04-03 16:45:00' },
    ipAddress: '192.168.1.105',
  },
  {
    id: 6,
    timestamp: '2026-04-03T15:30:15',
    userId: 'USR002',
    userName: 'Manager',
    email: 'manager@hotel.com',
    action: 'Check-out',
    actionType: 'CHECKOUT',
    module: 'Đặt Phòng',
    objectName: 'Đặt phòng #BK12340',
    description: 'Check-out khách Trần Thị C từ Phòng 105',
    oldValue: { status: 'Checked-in' },
    newValue: { status: 'Checked-out', checkOutTime: '2026-04-03 15:30:15' },
    ipAddress: '192.168.1.105',
  },
  {
    id: 7,
    timestamp: '2026-04-03T14:20:45',
    userId: 'USR001',
    userName: 'Admin',
    email: 'admin@hotel.com',
    action: 'Sửa',
    actionType: 'UPDATE',
    module: 'Vật Tư Theo Phòng',
    objectName: 'Phòng 201 - Khăn Tắm',
    description: 'Cập nhật số lượng khăn tắm từ 50 → 45 (5 chiếc hỏng)',
    oldValue: { quantity: 50, status: 'Full' },
    newValue: { quantity: 45, status: 'Partial' },
    ipAddress: '192.168.1.100',
  },
  {
    id: 8,
    timestamp: '2026-04-03T13:10:22',
    userId: 'USR002',
    userName: 'Manager',
    email: 'manager@hotel.com',
    action: 'Thanh toán',
    actionType: 'PAYMENT',
    module: 'Thanh Toán',
    objectName: 'Hóa đơn #INV202604001',
    description: 'Thanh toán hóa đơn từ khách Lê Văn D với số tiền 1.900.000đ',
    oldValue: { status: 'Pending', amount: '1,900,000đ' },
    newValue: { status: 'Paid', amount: '1,900,000đ', paymentMethod: 'Cash' },
    ipAddress: '192.168.1.105',
  },
  {
    id: 9,
    timestamp: '2026-04-03T12:00:00',
    userId: 'USR003',
    userName: 'Receptionist',
    email: 'receptionist@hotel.com',
    action: 'Thêm',
    actionType: 'CREATE',
    module: 'Khách Hàng',
    objectName: 'Nguyễn Văn E',
    description: 'Thêm khách hàng mới: SĐT 0987654321, Email: customer@example.com',
    oldValue: null,
    newValue: { name: 'Nguyễn Văn E', phone: '0987654321', email: 'customer@example.com' },
    ipAddress: '192.168.1.110',
  },
  {
    id: 10,
    timestamp: '2026-04-03T11:30:15',
    userId: 'USR001',
    userName: 'Admin',
    email: 'admin@hotel.com',
    action: 'Sửa',
    actionType: 'UPDATE',
    module: 'Quản lý Phòng',
    objectName: 'Phòng 102',
    description: 'Thay đổi trạng thái phòng từ "Bẩn" sang "Sạch"',
    oldValue: { status: 'Dirty', checkedTime: '2026-04-03 11:00:00' },
    newValue: { status: 'Clean', checkedTime: '2026-04-03 11:30:15' },
    ipAddress: '192.168.1.100',
  },
  {
    id: 11,
    timestamp: '2026-04-02T20:10:30',
    userId: 'USR002',
    userName: 'Manager',
    email: 'manager@hotel.com',
    action: 'Sửa',
    actionType: 'UPDATE',
    module: 'Quản lý Phòng',
    objectName: 'Phòng 303',
    description: 'Giá phòng tăng từ 800.000đ → 950.000đ',
    oldValue: { price: '800,000đ', type: 'Standard' },
    newValue: { price: '950,000đ', type: 'Standard' },
    ipAddress: '192.168.1.105',
  },
  {
    id: 12,
    timestamp: '2026-04-02T19:45:00',
    userId: 'USR001',
    userName: 'Admin',
    email: 'admin@hotel.com',
    action: 'Xóa',
    actionType: 'DELETE',
    module: 'Nhân viên & Quyền',
    objectName: 'Trần Văn F',
    description: 'Xóa tài khoản nhân viên (Chức vụ: Receptionist, Trạng thái: Inactive)',
    oldValue: { role: 'Receptionist', status: 'Inactive', email: 'tranvanf@hotel.com' },
    newValue: null,
    ipAddress: '192.168.1.100',
  },
];

/**
 * API Audit Logs
 */
export const auditLogApi = {
  // Lấy danh sách audit logs
  getAuditLogs: (params = {}) => {
    // Thực tế sẽ gọi: api.get('/audit-logs', { params })
    // Bây giờ trả về mock data
    return Promise.resolve({ data: MOCK_AUDIT_LOGS });
  },

  // Lọc audit logs
  filterAuditLogs: (filters = {}) => {
    return Promise.resolve({ data: MOCK_AUDIT_LOGS });
  },

  // Lấy chi tiết một audit log
  getAuditLogDetail: (id) => {
    const log = MOCK_AUDIT_LOGS.find(l => l.id === id);
    return Promise.resolve({ data: log });
  },

  // Xuất audit logs ra Excel (tùy chọn - chưa implement)
  exportAuditLogs: (filters = {}) => {
    // TODO: Implement when backend is ready
    // return api.post('/audit-logs/export', filters, { responseType: 'blob' });
    return Promise.resolve({ data: null });
  },

<<<<<<< HEAD
   // Thêm audit log mới
=======
  // Thêm audit log mới
>>>>>>> origin/phihung
  createAuditLog: (logData) => {
    const newLog = {
      id: MOCK_AUDIT_LOGS.length + 1,
      timestamp: new Date().toISOString(),
      userId: 'USR_CURRENT', // Sẽ lấy từ localStorage hoặc context
      userName: 'Housekeeper', // Sẽ lấy từ localStorage hoặc context
      email: 'housekeeper@hotel.com', // Sẽ lấy từ localStorage hoặc context
      ipAddress: '192.168.1.XXX',
      ...logData,
    };
    
    MOCK_AUDIT_LOGS.unshift(newLog);
    return Promise.resolve({ data: newLog });
  },
};
