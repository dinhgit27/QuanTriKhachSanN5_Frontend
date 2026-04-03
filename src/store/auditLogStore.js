import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import dayjs from 'dayjs';

/**
 * Zustand Store để quản lý Audit Logs toàn cộng
 * - Lưu tất cả audit logs
 * - Lưu notifications (real-time)
 * - Auto remove old logs
 * - Persist to localStorage
 */
export const useAuditLogStore = create(
  persist(
    (set, get) => ({
  // State
  auditLogs: [],
  notifications: [], // Thông báo mới (chưa xem)
  allNotifications: [], // Tất cả thông báo (kể cả đã xem)

  // Thêm audit log mới
  addAuditLog: (logData) => {
    const newLog = {
      id: Date.now(),
      timestamp: dayjs().format('YYYY-MM-DDTHH:mm:ss'),
      ...logData,
    };

    console.log('🔔 [Store] addAuditLog called:', newLog);

    set((state) => {
      console.log('📦 [Store] Updating state. Old count:', state.auditLogs.length, 'New count:', state.auditLogs.length + 1);
      return {
        auditLogs: [newLog, ...state.auditLogs],
        notifications: [newLog, ...state.notifications],
        allNotifications: [newLog, ...state.allNotifications],
      };
    });

    console.log('✅ [Store] State updated successfully');

    return newLog;
  },

  // Xóa notification khỏi danh sách chưa xem
  markNotificationAsRead: (notificationId) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== notificationId),
    }));
  },

  // Xóa tất cả notifications chưa xem
  markAllNotificationsAsRead: () => {
    set((state) => ({
      notifications: [],
    }));
  },

  // Lấy audit logs
  getAuditLogs: () => get().auditLogs,

  // Lấy notifications chưa xem
  getNotifications: () => get().notifications,

  // Lấy tất cả notifications
  getAllNotifications: () => get().allNotifications,

  // Clear all (test/reset)
  clearAll: () => {
    set({
      auditLogs: [],
      notifications: [],
      allNotifications: [],
    });
  },
    }),
    {
      name: 'auditLogStore', // localStorage key
      partialize: (state) => ({
        auditLogs: state.auditLogs,
        notifications: state.notifications,
        allNotifications: state.allNotifications,
      }), // Only persist these fields
    }
  )
);
