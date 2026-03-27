import React, { useState, useEffect } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import {
  Layout,
  Menu,
  Button,
  Avatar,
  Dropdown,
  Space,
  Typography,
  message,
} from "antd";
import {
  DashboardOutlined,
  UserOutlined,
  LogoutOutlined,
  DownOutlined,
} from "@ant-design/icons";
import { getUserRoles } from "../utils/auth";
import { useAdminAuthStore } from "../store/adminAuthStore";

const { Header, Content, Sider } = Layout;
const { Title } = Typography;

const AdminLayout = () => {
  const [userRoles, setUserRoles] = useState([]);
  const navigate = useNavigate();
  const clearAuth = useAdminAuthStore((state) => state.clearAuth);

  useEffect(() => {
    const roles = getUserRoles();
    setUserRoles(roles);
  }, []);

  const handleLogout = () => {
    clearAuth();
    message.success("Đăng xuất thành công!");
    navigate("/login");
  };

  // Chỉ Admin mới thấy Quản lý nhân sự
  const menuItems = [
    {
      key: "1",
      icon: <DashboardOutlined />,
      label: <Link to={userRoles.includes("Admin") ? "/admin/dashboard" : "/receptionist/dashboard"}>Dashboard</Link>,
    },
    userRoles.includes("Admin") && {
      key: "2",
      icon: <UserOutlined />,
      label: <Link to="/admin/users">Quản lý nhân sự</Link>,
    },
  ].filter(Boolean); // Lọc bỏ các giá trị null/false

  const userMenuItems = [
    {
      key: "logout",
      label: "Đăng xuất",
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider collapsible>
        <div style={{ height: 32, margin: 16, background: "rgba(255, 255, 255, 0.2)", textAlign: "center", lineHeight: "32px", color: "white", fontWeight: "bold" }}>
          HOTEL ERP
        </div>
        <Menu
          theme="dark"
          defaultSelectedKeys={["1"]}
          mode="inline"
          items={menuItems}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: "0 24px", background: "#fff", display: "flex", justifyContent: "flex-end", alignItems: "center" }}>
          <Dropdown menu={{ items: userMenuItems }}>
            <a onClick={(e) => e.preventDefault()}>
              <Space>
                <Avatar icon={<UserOutlined />} />
                {/* Hiển thị vai trò người dùng */}
                <span style={{textTransform: 'capitalize'}}>{userRoles.join(", ")}</span>
                <DownOutlined />
              </Space>
            </a>
          </Dropdown>
        </Header>
        <Content style={{ margin: "16px" }}>
          <div style={{ padding: 24, minHeight: 'calc(100vh - 132px)', background: "#fff", borderRadius: '8px' }}>
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;