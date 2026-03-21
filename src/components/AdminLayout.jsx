import React, { useState, useEffect } from 'react';
import { Layout, Menu, Avatar, Dropdown, message } from 'antd';
import {
  DashboardOutlined,
  HomeOutlined,
  BookOutlined,
  UserOutlined,
  TeamOutlined,
  BarChartOutlined,
  SettingOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (!user.role || user.role !== 'admin') {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    message.success('Đăng xuất thành công!');
    navigate('/login');
  };

  const menuItems = [
    {
      key: '/admin',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/admin/rooms',
      icon: <HomeOutlined />,
      label: 'Quản Lý Phòng',
    },
    {
      key: '/admin/bookings',
      icon: <BookOutlined />,
      label: 'Quản Lý Đặt Phòng',
    },
    {
      key: '/admin/customers',
      icon: <UserOutlined />,
      label: 'Quản Lý Khách Hàng',
    },
    {
      key: '/admin/staff',
      icon: <TeamOutlined />,
      label: 'Quản Lý Nhân Viên',
    },
    {
      key: '/admin/reports',
      icon: <BarChartOutlined />,
      label: 'Báo Cáo',
    },
    {
      key: '/admin/settings',
      icon: <SettingOutlined />,
      label: 'Cài Đặt',
    },
  ];

  const userMenu = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Đăng Xuất',
      onClick: handleLogout,
    },
  ];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        theme="dark"
        style={{
          background: 'linear-gradient(180deg, #1890ff 0%, #096dd9 100%)'
        }}
      >
        <div style={{
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '18px',
          fontWeight: 'bold',
          color: 'white',
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)'
        }}>
          {!collapsed && 'Hotel Admin'}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          style={{
            background: 'transparent'
          }}
        />
      </Sider>
      <Layout>
        <Header style={{
          background: '#fff',
          padding: '0 24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h2 style={{ margin: 0, color: '#1890ff' }}>Hệ Thống Quản Lý Khách Sạn</h2>
          <Dropdown menu={{ items: userMenu }} placement="bottomRight">
            <Avatar style={{ cursor: 'pointer', backgroundColor: '#1890ff' }}>
              A
            </Avatar>
          </Dropdown>
        </Header>
        <Content style={{ margin: '24px 16px', padding: 24, background: '#fff', minHeight: 280 }}>
          <div className="admin-content">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;