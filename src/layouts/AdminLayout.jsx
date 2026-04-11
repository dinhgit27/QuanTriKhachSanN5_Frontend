import React, { useState, useEffect } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { Layout, Menu, Avatar, Dropdown, Space, Typography, message, Tooltip, Button } from "antd";
import {
  DashboardOutlined,
  UserOutlined,
  LogoutOutlined,
  HomeOutlined,
  SafetyCertificateOutlined,
  LineChartOutlined,
  InboxOutlined,
  ShopOutlined,
  WarningOutlined,
  ClearOutlined,
  CalendarOutlined,
  UsergroupAddOutlined,
  TeamOutlined,
  ExportOutlined,
  FileDoneOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  AppstoreOutlined,
  SolutionOutlined,
  DatabaseOutlined,
  LinkOutlined
} from "@ant-design/icons";

import { getUserRoles } from "../utils/auth";
import { useAdminAuthStore } from "../store/adminAuthStore";
import NotificationBell from "../components/NotificationBell";

const { Header, Content, Sider } = Layout;

const COLORS = {
  siderBg: '#141414',
  siderMenuBg: '#141414',
  activeItemBg: '#fadb14',
  activeItemColor: '#000',
  textColor: '#a6a6a6',
  headerBg: '#ffffff',
  contentBg: '#f0f2f5',
  cardBg: '#ffffff'
};

const AdminLayout = () => {
  const [userRoles, setUserRoles] = useState([]);
  const navigate = useNavigate();
  const clearAuth = useAdminAuthStore((state) => state.clearAuth);
  const location = useLocation();

  const [collapsed, setCollapsed] = useState(false);
  const [openKeys, setOpenKeys] = useState([]);

  useEffect(() => {
    const roles = getUserRoles();
    setUserRoles(Array.isArray(roles) ? roles : [roles]);
  }, []);

  // Tự động tính toán và mở đúng thư mục mỗi khi chuyển trang
  useEffect(() => {
    const path = location.pathname;
    let keys = [];
    if (path.includes('/admin/bookings') || path.includes('/admin/checkout') || path.includes('/admin/arrivals') || path.includes('/admin/in-house') || path.includes('/admin/invoices') || path.includes('/receptionist/invoice-draft')) {
      keys = ['folder-reception'];
    } else if (path.includes('/admin/warehouse') || path.includes('/admin/inventory') || path.includes('/admin/loss-and-damage')) {
      keys = ['folder-assets'];
    } else if (path.includes('/homepage') || path.includes('/receptionist/dashboard')) {
      keys = ['folder-links'];
    } else {
      keys = ['folder-main'];
    }
    setOpenKeys(keys);
  }, [location.pathname]);

  const handleLogout = () => {
    clearAuth();
    message.success("Đăng xuất thành công!");
    navigate("/login");
  };

  const isAdmin = userRoles.includes("Admin");
  const isReceptionist = userRoles.includes("Receptionist");
  const isHousekeeping = userRoles.includes("Housekeeping");

  const menuItems = [
    (isAdmin || isHousekeeping) && {
      key: 'folder-main',
      icon: <AppstoreOutlined />,
      label: <span style={{ fontWeight: 'bold' }}>MENU CHÍNH</span>,
      children: [
        isAdmin && { key: "/admin/dashboard", icon: <DashboardOutlined />, label: <Link to="/admin/dashboard">Tổng quan</Link> },
        isAdmin && { key: "/admin/rooms", icon: <HomeOutlined />, label: <Link to="/admin/rooms">Quản lý Phòng</Link> },
        isAdmin && { key: "/admin/users", icon: <UserOutlined />, label: <Link to="/admin/users">Nhân viên & Quyền</Link> },
        isAdmin && { key: "/admin/accounting", icon: <LineChartOutlined />, label: <Link to="/admin/accounting">Kế toán</Link> },
        isAdmin && { key: "/admin/audit", icon: <SafetyCertificateOutlined />, label: <Link to="/admin/audit">Audit Logs</Link> },
        (isAdmin || isHousekeeping) && { key: "/admin/housekeeping", icon: <ClearOutlined />, label: <Link to="/admin/housekeeping">Dọn Phòng</Link> }
      ].filter(Boolean)
    },

    (isAdmin || isReceptionist) && {
      key: 'folder-reception',
      icon: <SolutionOutlined />,
      label: <span style={{ fontWeight: 'bold' }}>QUẦY LỄ TÂN</span>,
      children: [
        { key: "/admin/bookings", icon: <CalendarOutlined />, label: <Link to="/admin/bookings">Quản lý Đặt phòng</Link> },
        { key: "/admin/arrivals", icon: <UsergroupAddOutlined />, label: <Link to="/admin/arrivals">Khách đến hôm nay</Link> },
        { key: "/admin/in-house", icon: <TeamOutlined />, label: <Link to="/admin/in-house">Khách đang lưu trú</Link> },
        { key: "/admin/checkout", icon: <ExportOutlined />, label: <Link to="/admin/checkout">Trả phòng</Link> },
        { key: "/admin/invoices", icon: <FileDoneOutlined />, label: <Link to="/admin/invoices">Hóa đơn</Link> }
      ].filter(Boolean)
    },

    (isAdmin || isReceptionist || isHousekeeping) && {
      key: 'folder-assets',
      icon: <DatabaseOutlined />,
      label: <span style={{ fontWeight: 'bold' }}>QUẢN LÝ TÀI SẢN</span>,
      children: [
        isAdmin && { key: "/admin/warehouse", icon: <InboxOutlined />, label: <Link to="/admin/warehouse">Kho Vật Tư</Link> },
        (isAdmin || isHousekeeping) && { key: "/admin/inventory", icon: <ShopOutlined />, label: <Link to="/admin/inventory">Vật Tư Phòng</Link> },
        (isAdmin || isReceptionist) && { key: "/admin/loss-and-damage", icon: <WarningOutlined />, label: <Link to="/admin/loss-and-damage">Đền Bù</Link> }
      ].filter(Boolean)
    },

    {
      key: 'folder-links',
      icon: <LinkOutlined />,
      label: <span style={{ fontWeight: 'bold' }}>LIÊN KẾT NHANH</span>,
      children: [
        { key: "/homepage", icon: <HomeOutlined />, label: <Link to="/homepage">Trang chủ</Link> },
        isReceptionist && { key: "/receptionist/dashboard", icon: <DashboardOutlined />, label: <Link to="/receptionist/dashboard">Bàn Lễ tân</Link> }
      ].filter(Boolean)
    }
  ].filter(Boolean);

  const userMenuItems = [
    { key: "profile", icon: <UserOutlined />, label: "Hồ sơ của tôi" },
    { type: 'divider' },
    { key: "logout", label: <span style={{ color: 'red' }}>Đăng xuất</span>, icon: <LogoutOutlined style={{ color: 'red' }} />, onClick: handleLogout },
  ];

  // Xử lý sự kiện khi người dùng tự bấm mở/đóng thư mục
  const onOpenChange = (keys) => {
    setOpenKeys(keys);
  };

  return (
    <Layout style={{ minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={250}
        collapsedWidth={80}
        style={{
          background: COLORS.siderBg,
          display: 'flex', flexDirection: 'column', height: '100vh',
          position: 'fixed', left: 0, top: 0, bottom: 0, zIndex: 100,
          transition: 'all 0.2s ease'
        }}
      >
        <div style={{ padding: collapsed ? '24px 0' : '24px 20px', display: 'flex', justifyContent: collapsed ? 'center' : 'flex-start', alignItems: 'center', gap: 12, transition: 'all 0.2s' }}>
          <div style={{ width: 40, height: 40, background: COLORS.activeItemBg, borderRadius: 8, display: 'flex', justifyContent: 'center', alignItems: 'center', flexShrink: 0 }}>
            <HomeOutlined style={{ color: COLORS.activeItemColor, fontSize: 20 }} />
          </div>
          {!collapsed && (
            <div style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}>
              <div style={{ color: 'white', fontWeight: 'bold', fontSize: 16, lineHeight: 1.2 }}>IT CODE</div>
              <div style={{ color: '#8c8c8c', fontSize: 12 }}>Hotel Management</div>
            </div>
          )}
        </div>

        <div className="custom-menu-scroll" style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[location.pathname]}
            openKeys={openKeys}
            onOpenChange={onOpenChange}
            items={menuItems}
            style={{ background: COLORS.siderMenuBg, borderRight: 'none', padding: collapsed ? '0' : '0 10px' }}
          />
        </div>

        <div style={{ padding: collapsed ? '16px 0' : '16px 20px', borderTop: '1px solid #333', background: '#0d0d0d', display: 'flex', justifyContent: collapsed ? 'center' : 'space-between', alignItems: 'center' }}>
          {!collapsed && (
            <Dropdown menu={{ items: userMenuItems }} placement="topRight">
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                <Avatar size={32} style={{ backgroundColor: COLORS.activeItemBg, color: COLORS.activeItemColor, fontWeight: 'bold' }}>
                  {userRoles[0]?.charAt(0).toUpperCase() || 'U'}
                </Avatar>
                <div style={{ overflow: 'hidden' }}>
                  <div style={{ color: 'white', fontWeight: 'bold', fontSize: 13, whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                    {isAdmin ? 'Quản Lý' : (isHousekeeping ? 'Buồng Phòng' : 'Nhân Viên')}
                  </div>
                </div>
              </div>
            </Dropdown>
          )}

          <Tooltip title={collapsed ? "Mở rộng" : "Thu gọn"} placement="right">
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ color: '#8c8c8c', fontSize: '18px', width: 40, height: 40 }}
            />
          </Tooltip>
        </div>
      </Sider>

      <Layout style={{ marginLeft: collapsed ? 80 : 250, background: COLORS.contentBg, transition: 'all 0.2s ease' }}>
        <Header style={{ background: COLORS.headerBg, padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', height: 64, position: 'sticky', top: 0, zIndex: 10 }}>
          <Space size={16} style={{ alignItems: 'center' }}>
            <NotificationBell />
            <div style={{ height: 28, width: 1, background: '#e8e8e8' }}></div>
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '6px 8px', borderRadius: 6, transition: 'all 0.3s' }} onMouseEnter={(e) => e.currentTarget.style.background = '#fafafa'} onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
                <Avatar size={36} style={{ backgroundColor: COLORS.activeItemBg, color: COLORS.activeItemColor, fontWeight: 'bold', fontSize: 15 }}>
                  {userRoles[0]?.charAt(0).toUpperCase() || 'A'}
                </Avatar>
                <div style={{ minWidth: 'auto' }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#262626', lineHeight: 1.2 }}>
                    {isAdmin ? 'Admin' : (isHousekeeping ? 'Buồng Phòng' : 'Nhân Viên')}
                  </div>
                  <div style={{ fontSize: 10, color: '#8c8c8c', lineHeight: 1.2 }}>{userRoles.join(', ')}</div>
                </div>
              </div>
            </Dropdown>
          </Space>
        </Header>

        <Content style={{ padding: '24px' }}>
          <div style={{ background: COLORS.cardBg, borderRadius: 12, minHeight: 'calc(100vh - 48px)', overflow: 'hidden' }}>
            <Outlet />
          </div>
        </Content>
      </Layout>

      <style>{`
        .custom-menu-scroll::-webkit-scrollbar { width: 6px; }
        .custom-menu-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-menu-scroll::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 4px; }
        .custom-menu-scroll:hover::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.3); }

        .ant-menu-dark .ant-menu-item { color: ${COLORS.textColor}; border-radius: 8px; margin-bottom: 4px; }
        .ant-menu-dark .ant-menu-item:hover { color: white !important; background: rgba(255,255,255,0.08) !important; }
        
        .ant-menu-dark.ant-menu-dark .ant-menu-item-selected { background-color: ${COLORS.activeItemBg} !important; color: ${COLORS.activeItemColor} !important; font-weight: bold; }
        .ant-menu-dark.ant-menu-dark .ant-menu-item-selected .anticon { color: ${COLORS.activeItemColor} !important; }

        .ant-menu-dark .ant-menu-submenu-title { color: ${COLORS.textColor}; border-radius: 8px; margin-bottom: 4px; }
        .ant-menu-dark .ant-menu-submenu-title:hover { color: white !important; background: rgba(255,255,255,0.08) !important; }
        .ant-menu-dark .ant-menu-sub { background: transparent !important; }
      `}</style>
    </Layout>
  );
};

export default AdminLayout;