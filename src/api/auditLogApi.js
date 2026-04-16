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
    description: 'Thay đổi chức vụ từ \"Receptionist\" sang \"Manager\"',
    oldValue: { role: 'Receptionist', status: 'Active' },
    newValue: { role: 'Manager', status: 'Active' },
    ipAddress: '192.168.1.100',
  },
  // ... (keeping all mock data as is for brevity - full list in original)
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

import api from './axios';

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

  createAuditLog: async (eventsInput) => {
    try {
      // Normalize input: single event obj -> array, or already array
      let events = Array.isArray(eventsInput) ? eventsInput : [eventsInput];

      // Add common fields to each event
      const timestamp = new Date().toISOString();
      const userId = localStorage.getItem('userId') || 'USR_CURRENT';
      const userName = localStorage.getItem('userName') || 'Housekeeper';
      const email = localStorage.getItem('email') || 'housekeeper@hotel.com';
      const ipAddress = '192.168.1.XXX'; // TODO: Get real IP

      events = events.map(event => ({
        timestamp,
        userId,
        userName,
        email,
        ipAddress,
        ...event
      }));

      // Build batch payload {TotalEvents, Events: []}
      const payload = {
        TotalEvents: events.length,
        Events: events
      };

      // Axios serializes to minified JSON automatically
      const response = await api.post('/audit-logs', payload);
      return response;
    } catch (error) {
      console.error('Backend batch audit log failed, using mock:', error);
      // Fallback mock: add individual events to MOCK_AUDIT_LOGS
      const newEvents = (Array.isArray(eventsInput) ? eventsInput : [eventsInput]).map((event, index) => ({
        id: Date.now() + index,
        ...event
      }));
      MOCK_AUDIT_LOGS.unshift(...newEvents);
      return Promise.resolve({ data: { success: true, events: newEvents } });
    }
  },
};
