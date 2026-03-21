import React, { useState } from 'react';
import { Layout, Menu, Button, Badge } from 'antd'; // Thêm Badge [cite: 576]
import { UserOutlined, TeamOutlined, LogoutOutlined, BellOutlined } from '@ant-design/icons'; // Thêm BellOutlined [cite: 576]
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { useAdminAuthStore } from '../store/adminAuthStore';
import { useSignalR } from '../hooks/useSignalR'; // Import Custom Hook [cite: 577]

const { Header, Sider, Content } = Layout;

const AdminLayout = () => {
  const navigate = useNavigate();
  const clearAuth = useAdminAuthStore(state => state.clearAuth);
  const user = useAdminAuthStore(state => state.user);

  // State quản lý thông báo [cite: 580-581]
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);

  // Đăng ký lắng nghe SignalR [cite: 582-585]
  useSignalR((newNotif) => {
    setUnreadCount(prev => prev + 1); // Tăng số đếm chuông
    setNotifications(prev => [newNotif, ...prev]); // Thêm thông báo mới lên đầu danh sách
  });

  const handleLogout = () => {
    clearAuth();
    navigate('/login');
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider theme="dark">
        <div style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)', textAlign: 'center', color: 'white', lineHeight: '32px' }}>
          HOTEL ERP
        </div>
        <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']}>
          <Menu.Item key="1" icon={<TeamOutlined />}>
            <Link to="/admin/users">Quản lý User</Link>
          </Menu.Item>
          <Menu.Item key="2" icon={<UserOutlined />}>
            <Link to="/admin/profile">Hồ sơ cá nhân</Link>
          </Menu.Item>
        </Menu>
      </Sider>
      
      <Layout>
        <Header style={{ padding: '0 24px', background: '#fff', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          
          {/* Khu vực Chuông thông báo [cite: 589-591] */}
          <Badge count={unreadCount} overflowCount={99} style={{ marginRight: 24, cursor: 'pointer' }}>
            <BellOutlined style={{ fontSize: 20, marginRight: 24 }} />
          </Badge>

          <span style={{ marginRight: 16 }}>Xin chào, {user?.fullName || 'Admin'}</span>
          
          <Button type="primary" danger icon={<LogoutOutlined />} onClick={handleLogout}>
            Đăng xuất
          </Button>
        </Header>
        
        <Content style={{ margin: '24px 16px', padding: 24, minHeight: 280, background: '#fff' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;