import { useEffect, useRef } from 'react';
import * as signalR from '@microsoft/signalr';
import { notification } from 'antd';
import { useAdminAuthStore } from '../store/adminAuthStore';

export const useSignalR = (onNewNotification) => {
  const connectionRef = useRef(null);
  const token = useAdminAuthStore((state) => state.token); // Lấy token từ Zustand [cite: 553, 555]

  useEffect(() => {
    // Nếu chưa đăng nhập thì không kết nối
    if (!token) return;

    // Khởi tạo kết nối SignalR [cite: 557]
    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${import.meta.env.VITE_SIGNALR_URL}/notificationHub`, {
        accessTokenFactory: () => token // Truyền JWT vào Query String cho WebSocket [cite: 558-559]
      })
      .withAutomaticReconnect() // Tự động kết nối lại khi rớt mạng [cite: 561, 603-604]
      .build();

    // Lắng nghe sự kiện "ReceiveNotification" từ Server [cite: 562]
    connection.on("ReceiveNotification", (data) => {
      // Gọi callback để cập nhật state (số đếm, danh sách) ở Component [cite: 563]
      if (onNewNotification) onNewNotification(data); 

      // Bật Toast thông báo (Pop-up góc màn hình) của Ant Design [cite: 564-568]
      notification[data.type?.toLowerCase() || 'info']({
        message: data.title,
        description: data.content,
        placement: 'topRight',
      });
    });

    // Bắt đầu kết nối [cite: 570]
    connection.start().catch(console.error);
    connectionRef.current = connection;

    // Cleanup: Ngắt kết nối khi Component bị hủy (unmount) hoặc token thay đổi [cite: 572]
    return () => {
      if (connectionRef.current) {
        connectionRef.current.stop();
      }
    };
  }, [token]); // Chạy lại effect nếu token thay đổi (ví dụ: đăng nhập tài khoản khác)
};