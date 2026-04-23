import React, { useState, useEffect } from "react";
import { Link, Outlet, useNavigate, useLocation } from "react-router-dom";
import { Layout, Menu, Avatar, Dropdown, Space, Typography, message, Divider } from "antd";
import {
  DashboardOutlined,
  UserOutlined,
  LogoutOutlined,
  HomeOutlined,
  AppstoreOutlined,
  SafetyCertificateOutlined,
  LineChartOutlined,
  InboxOutlined,      // Icon cho Kho vật tư
  ShopOutlined,       // Icon cho Vật tư phòng
  WarningOutlined,    // Icon cho Biên bản đền bù
  ClearOutlined,       // THÊM: Icon cho Dọn phòng
  FileTextOutlined    // 👉 THÊM ICON BÀI VIẾT NÀY VÀO
} from "@ant-design/icons";

// Ní nhớ import đúng store/utils của ní nha
import { getUserRoles } from "../utils/auth";
import { useAdminAuthStore } from "../store/adminAuthStore";
import NotificationBell from "../components/NotificationBell";

const { Header, Content, Sider } = Layout;
const { Text } = Typography;

// --- BẢNG MÀU CHUẨN XỊN (GIỐNG HÌNH) ---
const COLORS = {
  siderBg: '#141414',       // Đen nhám
  siderMenuBg: '#141414',   
  activeItemBg: '#fadb14',  // Vàng gold
  activeItemColor: '#000',  // Chữ đen trên nền vàng
  textColor: '#a6a6a6',     // Xám nhạt cho menu thường
  headerBg: '#ffffff',      // Trắng
  contentBg: '#f0f2f5',     // Xám nhẹ của nền
  cardBg: '#ffffff'         // Trắng của nội dung
};

const AdminLayout = () => {
  const [userRoles, setUserRoles] = useState([]);
  const navigate = useNavigate();
  const clearAuth = useAdminAuthStore((state) => state.clearAuth);
  const location = useLocation();

  useEffect(() => {
    // Lấy role từ localStorage (sửa lại logic nếu file utils của ní khác)
    const roles = getUserRoles(); 
    setUserRoles(Array.isArray(roles) ? roles : [roles]); 
  }, []);

  const handleLogout = () => {
    clearAuth();
    message.success("Đăng xuất thành công!");
    navigate("/login");
  };

  const isAdmin = userRoles.includes("Admin");
  const isReceptionist = userRoles.includes("Receptionist");
  const isHousekeeping = userRoles.includes("Housekeeping"); // THÊM: Phân quyền cho Buồng phòng

  // --- CẤU TRÚC MENU THEO NHÓM ---
  const menuItems = [
    // 1. NHÓM: MENU CHÍNH
    (isAdmin || isHousekeeping) && {
      type: 'group',
      label: <span style={{ color: '#595959', fontSize: 12, fontWeight: 'bold' }}>MENU CHÍNH</span>,
      children: [
        isAdmin && {
          key: "/admin/dashboard", 
          icon: <DashboardOutlined />,
          label: <Link to="/admin/dashboard">Tổng quan</Link>,
        },
        isAdmin && {
          key: "/admin/rooms",
          icon: <HomeOutlined />,
          label: <Link to="/admin/rooms">Quản lý Phòng</Link>,
        },
        isAdmin && {
          key: "/admin/users",
          icon: <UserOutlined />,
          label: <Link to="/admin/users">Nhân viên & Quyền</Link>,
        },
        isAdmin && {
          key: "/admin/accounting",
          icon: <LineChartOutlined />,
          label: <Link to="/admin/accounting">Kế toán</Link>,
        },
        isAdmin && {
          key: "/admin/audit",
          icon: <SafetyCertificateOutlined />,
          label: <Link to="/admin/audit">Audit Logs</Link>,
        },
        // 👉 THÊM MENU BÀI VIẾT VÀO ĐÂY:
        isAdmin && {
          key: "/admin/posts",
          icon: <FileTextOutlined />,
          label: <Link to="/admin/posts">Quản lý Bài viết</Link>,
        },
        // THÊM: Menu Dọn phòng (Admin và Housekeeping đều thấy)
        (isAdmin || isHousekeeping) && {
          key: "/admin/housekeeping",
          icon: <ClearOutlined />,
          label: <Link to="/admin/housekeeping">Nhiệm Vụ Dọn Phòng</Link>,
        }
      ].filter(Boolean)
    },

    // 2. NHÓM: QUẢN LÝ TÀI SẢN (Đã gom 3 trang vào đây)
    (isAdmin || isReceptionist || isHousekeeping) && {
        type: 'group',
        label: <span style={{ color: '#595959', fontSize: 12, fontWeight: 'bold' }}>QUẢN LÝ TÀI SẢN</span>,
        children: [
          isAdmin && {
            key: "/admin/warehouse", 
            icon: <InboxOutlined />,
            label: <Link to="/admin/warehouse">Kho Vật Tư Tổng</Link>,
          },
          (isAdmin || isHousekeeping) && {
            key: "/admin/inventory", 
            icon: <ShopOutlined />,
            label: <Link to="/admin/inventory">Vật Tư Theo Phòng</Link>,
          },
          (isAdmin || isReceptionist) && {
            key: "/admin/loss-and-damage", 
            icon: <WarningOutlined />,
            label: <Link to="/admin/loss-and-damage">Biên Bản Đền Bù</Link>,
          }
        ].filter(Boolean)
    },

    // 3. NHÓM: LIÊN KẾT NHANH (Dành cho tất cả hoặc Lễ tân)
    {
      type: 'group',
      label: <span style={{ color: '#595959', fontSize: 12, fontWeight: 'bold', marginTop: 20, display: 'block' }}>LIÊN KẾT NHANH</span>,
      children: [
        {
          key: "/homepage",
          icon: <AppstoreOutlined />,
          label: <Link to="/homepage">Trang chủ</Link>,
        },
        isReceptionist && {
          key: "/receptionist/dashboard",
          icon: <DashboardOutlined />,
          label: <Link to="/receptionist/dashboard">Bàn Lễ tân</Link>,
        }
      ].filter(Boolean)
    }
  ].filter(Boolean);

  // Mở menu User (Góc dưới cùng bên trái giống hình)
  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Hồ sơ của tôi",
    },
    {
      type: 'divider',
    },
    {
      key: "logout",
      label: <span style={{ color: 'red' }}>Đăng xuất</span>,
      icon: <LogoutOutlined style={{ color: 'red' }}/>,
      onClick: handleLogout,
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      {/* SIDER BÊN TRÁI (THEME ĐEN) */}
      <Sider 
        width={250} 
        style={{ 
          background: COLORS.siderBg,
          display: 'flex',
          flexDirection: 'column',
          height: '100vh',
          position: 'fixed',
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        {/* Logo góc trên trái */}
        <div style={{ padding: '24px 20px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ 
            width: 40, height: 40, background: COLORS.activeItemBg, 
            borderRadius: 8, display: 'flex', justifyContent: 'center', alignItems: 'center' 
          }}>
            <HomeOutlined style={{ color: COLORS.activeItemColor, fontSize: 20 }} />
          </div>
          <div>
            <div style={{ color: 'white', fontWeight: 'bold', fontSize: 16, lineHeight: 1.2 }}>IT CODE</div>
            <div style={{ color: '#8c8c8c', fontSize: 12 }}>Hotel Management</div>
          </div>
        </div>

        {/* Menu cuộn được ở giữa */}
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
            <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[location.pathname]}
            items={menuItems}
            style={{ 
                background: COLORS.siderMenuBg,
                borderRight: 'none',
                padding: '0 10px'
            }}
            />
        </div>

        {/* Thông tin User góc dưới cùng bên trái */}
        <div style={{ 
            padding: '16px 20px', 
            borderTop: '1px solid #333',
            background: '#0d0d0d'
        }}>
            <Dropdown menu={{ items: userMenuItems }} placement="topRight" arrow={{ pointAtCenter: true }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
                    <Avatar style={{ backgroundColor: COLORS.activeItemBg, color: COLORS.activeItemColor, fontWeight: 'bold' }}>
                        {userRoles[0]?.charAt(0).toUpperCase() || 'U'}
                    </Avatar>
                    <div style={{ overflow: 'hidden' }}>
                        <div style={{ color: 'white', fontWeight: 'bold', fontSize: 14, whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
                            {isAdmin ? 'Quản Lý Admin' : (isHousekeeping ? 'Buồng Phòng' : 'Nhân Viên')}
                        </div>
                        <div style={{ color: '#8c8c8c', fontSize: 12 }}>{userRoles.join(", ")}</div>
                    </div>
                    <LogoutOutlined style={{ color: '#8c8c8c', marginLeft: 'auto' }} onClick={handleLogout}/>
                </div>
            </Dropdown>
        </div>
      </Sider>

      {/* KHU VỰC NỘI DUNG BÊN PHẢI */}
      <Layout style={{ marginLeft: 250, background: COLORS.contentBg }}>
        {/* HEADER (với icon chuông thông báo) */}
        <Header
          style={{
            background: COLORS.headerBg,
            padding: '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            height: 64,
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}
        >
          {/* Icons bên phải */}
          <Space size={16} style={{ alignItems: 'center' }}>
            {/* Icon Chuông Thông báo */}
            <NotificationBell />

            {/* Divider */}
            <div style={{ height: 28, width: 1, background: '#e8e8e8' }}></div>

            {/* User Avatar */}
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" arrow={{ pointAtCenter: true }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: 8, 
                cursor: 'pointer',
                padding: '6px 8px',
                borderRadius: 6,
                transition: 'all 0.3s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#fafafa'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <Avatar 
                  size={36}
                  style={{ 
                    backgroundColor: COLORS.activeItemBg, 
                    color: COLORS.activeItemColor,
                    fontWeight: 'bold',
                    fontSize: 15,
                  }}
                >
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

        {/* CONTENT */}
        <Content style={{ padding: '24px' }}>
          <div style={{ background: COLORS.cardBg, borderRadius: 12, minHeight: 'calc(100vh - 48px)', overflow: 'hidden' }}>
            <Outlet />
          </div>
        </Content>
      </Layout>

      {/* CỘNG THÊM TÍ CSS ĐỂ ĐÈ MÀU MẶC ĐỊNH CỦA ANT DESIGN */}
      <style>{`
        /* Chỉnh màu chữ menu thường */
        .ant-menu-dark .ant-menu-item { color: ${COLORS.textColor}; border-radius: 8px; margin-bottom: 4px; }
        .ant-menu-dark .ant-menu-item:hover { color: white !important; background: rgba(255,255,255,0.08) !important; }
        
        /* Chỉnh màu menu đang được chọn (Vàng gold giống hình) */
        .ant-menu-dark.ant-menu-dark .ant-menu-item-selected { 
            background-color: ${COLORS.activeItemBg} !important; 
            color: ${COLORS.activeItemColor} !important; 
            font-weight: bold;
        }
        .ant-menu-dark.ant-menu-dark .ant-menu-item-selected .anticon { color: ${COLORS.activeItemColor} !important; }
        
        /* Chữ của Group */
        .ant-menu-item-group-title { padding-left: 12px !important; }
      `}</style>
    </Layout>
  );
};

export default AdminLayout;