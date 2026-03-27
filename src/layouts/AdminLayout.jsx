import React from 'react';
import { Layout, Menu, Button, Spin, Badge, Avatar } from 'antd';
import { Outlet, useNavigate } from 'react-router-dom';
import { BellOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons';
import { useAdminAuthStore } from '../store/adminAuthStore';
import { useLoadingStore } from '../store/loadingStore';

const { Header, Sider, Content } = Layout;

const AdminLayout = () => {
    const navigate = useNavigate();
    const { user, clearAuth } = useAdminAuthStore();
    const isLoading = useLoadingStore((state) => state.isLoading);

    const handleLogout = () => {
        clearAuth();
        navigate('/login');
    };

    return (
        // Global Loading Overlay: Spin bao trùm toàn bộ
        <Spin spinning={isLoading} tip="Đang tải dữ liệu..." size="large">
            <Layout style={{ minHeight: '100vh' }}>
                {/* Sidebar: Menu điều hướng */}
                <Sider collapsible>
                    <div className="logo" style={{ height: 32, margin: 16, background: 'rgba(255, 255, 255, 0.2)' }} />
                    <Menu theme="dark" defaultSelectedKeys={['1']} mode="inline">
                        <Menu.Item key="1" onClick={() => navigate('/admin/dashboard')}>Dashboard</Menu.Item>
                        <Menu.Item key="2" onClick={() => navigate('/admin/users')}>Quản lý Nhân sự</Menu.Item>
                    </Menu>
                </Sider>
                
                <Layout className="site-layout">
                    {/* Header: Avatar, Chuông báo, Nút Đăng xuất */}
                    <Header style={{ padding: '0 24px', background: '#fff', display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '24px' }}>
                        <Badge count={3}>
                            <BellOutlined style={{ fontSize: '20px', cursor: 'pointer' }} />
                        </Badge>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <Avatar icon={<UserOutlined />} />
                            <span>{user?.fullName || 'Admin'}</span>
                            <Button type="primary" danger icon={<LogoutOutlined />} onClick={handleLogout}>Đăng xuất</Button>
                        </div>
                    </Header>
                    
                    {/* Content: Vùng render động qua cơ chế <Outlet /> */}
                    <Content style={{ margin: '16px' }}>
                        <div style={{ padding: 24, minHeight: 360, background: '#fff', borderRadius: '8px' }}>
                            <Outlet />
                        </div>
                    </Content>
                </Layout>
            </Layout>
        </Spin>
    );
};

export default AdminLayout;