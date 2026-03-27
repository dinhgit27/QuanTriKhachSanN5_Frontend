import React from "react";
import { Button, Card, Typography, message } from "antd";
import { LogoutOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

const GuestDashboard = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    message.success("Đăng xuất thành công!");
    navigate("/login");
  };

  return (
    <div style={{ padding: "20px", background: "#f0f2f5", minHeight: "100vh" }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <Title level={3} style={{margin: 0}}>Trang Khách hàng</Title>
            <Button
              type="primary"
              danger
              icon={<LogoutOutlined />}
              onClick={handleLogout}
            >
              Đăng xuất
            </Button>
        </div>
        <p>Chào mừng bạn. Tại đây bạn có thể xem thông tin đặt phòng của mình.</p>
        {/* Các chức năng dành cho khách hàng sẽ được thêm ở đây */}
      </Card>
    </div>
  );
};

export default GuestDashboard;