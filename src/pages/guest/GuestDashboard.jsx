import React from "react";
import { 
  Layout, Menu, Button, Card, Typography, Avatar, 
  Row, Col, Tag, Space, Divider, message 
} from "antd";
import { 
  LogoutOutlined, DashboardOutlined, HistoryOutlined, 
  FileTextOutlined, StarOutlined, SettingOutlined,
  CalendarOutlined, TrophyOutlined, CreditCardOutlined,
  FacebookFilled, InstagramFilled, TwitterOutlined, YoutubeFilled
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";

const { Header, Content, Sider, Footer } = Layout;
const { Title, Text } = Typography;

// Định nghĩa màu chủ đạo cho Luxury Hotel
const COLORS = {
  gold: "#c19b4a",
  lightGold: "#fdf8ef",
  dark: "#1a1a1a",
  gray: "#8c8c8c",
  bg: "#f8f9fa"
};

const GuestDashboard = () => {
  const navigate = useNavigate();

  const headerMenuItems = [
    { key: '1', label: <Link to="/homepage">Trang chủ</Link> },
    { key: '2', label: <Link to="/guest/bookings">Đặt phòng</Link> },
    { key: '3', label: <Link to="/guest/profile">Tài khoản</Link> }
  ];

  const sidebarMenuItems = [
    { key: '1', icon: <DashboardOutlined />, label: <Link to="/guest/dashboard">Tổng quan</Link> },
    { key: '2', icon: <HistoryOutlined />, label: <Link to="/guest/dashboard">Lịch sử đặt phòng</Link> },
    { key: '3', icon: <FileTextOutlined />, label: <Link to="/guest/dashboard">Hóa đơn</Link> },
    { key: '4', icon: <TrophyOutlined />, label: <Link to="/guest/dashboard">Hạng thành viên</Link> },
    { key: '5', icon: <StarOutlined />, label: <Link to="/guest/dashboard">Đánh giá của tôi</Link> },
    { key: '6', icon: <SettingOutlined />, label: <Link to="/guest/profile">Cài đặt tài khoản</Link> }
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    message.success("Đăng xuất thành công!");
    navigate("/login");
  };

  return (
    <Layout style={{ minHeight: "100vh", background: COLORS.bg }}>
      {/* HEADER */}
      <Header style={{ 
        background: "#fff", 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        padding: "0 50px",
        height: "80px",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        position: "sticky",
        top: 0,
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ width: 40, height: 40, background: COLORS.gold, borderRadius: 8, display: 'flex', justifyContent: 'center', alignItems: 'center', marginRight: 10 }}>
            <span style={{ color: '#fff', fontWeight: 'bold' }}>G</span>
          </div>
          <Title level={4} style={{ margin: 0, color: COLORS.dark, letterSpacing: '1px' }}>GRAND HOTEL</Title>
        </div>
        
        <Menu mode="horizontal" defaultSelectedKeys={['3']} items={headerMenuItems} style={{ border: 'none', flex: 1, justifyContent: 'center' }} />

        <Space size="middle">
          <div style={{ textAlign: 'right' }}>
            <Text strong block>Nguyễn Văn Khách</Text>
            <Tag color="gold">Khách hàng</Tag>
          </div>
          <Avatar size={45} src="https://i.pravatar.cc/150?u=4" />
        </Space>
      </Header>

      <Layout style={{ padding: "40px 50px", background: COLORS.bg }}>
        {/* SIDEBAR */}
        <Sider width={280} style={{ background: 'transparent' }}>
          <Card bordered={false} style={{ borderRadius: 16, textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <Avatar size={100} src="https://i.pravatar.cc/150?u=4" style={{ border: `3px solid ${COLORS.gold}` }} />
            <Title level={4} style={{ marginTop: 15, marginBottom: 0 }}>Nguyễn Văn Minh</Title>
            <Text type="secondary">nguyenvanminh@email.com</Text>
            <div style={{ marginTop: 15 }}>
              <Tag color={COLORS.gold} style={{ borderRadius: 20, padding: '2px 15px', fontWeight: 'bold' }}>
                 🏆 Gold Member
              </Tag>
            </div>
            
            <Divider />
            
            <Menu
              mode="vertical"
              defaultSelectedKeys={['1']}
              style={{ border: 'none', textAlign: 'left' }}
              items={sidebarMenuItems}
            />
            
            <Button 
              type="text" 
              danger 
              icon={<LogoutOutlined />} 
              onClick={handleLogout}
              style={{ marginTop: 20, width: '100%', textAlign: 'left', paddingLeft: 24 }}
            >
              Đăng xuất
            </Button>
          </Card>
        </Sider>

        {/* MAIN CONTENT */}
        <Content style={{ paddingLeft: 40 }}>
          <Title level={2}>Chào mừng trở lại, Minh!</Title>
          
          {/* Stats Grid */}
          <Row gutter={24} style={{ marginBottom: 30 }}>
            <Col span={8}>
              <Card bordered={false} style={{ borderRadius: 16 }}>
                <Space size="large">
                  <Avatar shape="square" size={48} icon={<CalendarOutlined />} style={{ background: '#e6f7ff', color: '#1890ff' }} />
                  <div>
                    <Text type="secondary" block>Lượt đặt phòng</Text>
                    <Title level={2} style={{ margin: 0 }}>1</Title>
                  </div>
                </Space>
              </Card>
            </Col>
            <Col span={8}>
              <Card bordered={false} style={{ borderRadius: 16, borderRight: `4px solid ${COLORS.gold}` }}>
                <Space size="large">
                  <Avatar shape="square" size={48} icon={<TrophyOutlined />} style={{ background: COLORS.lightGold, color: COLORS.gold }} />
                  <div>
                    <Text type="secondary" block>Điểm tích lũy</Text>
                    <Title level={2} style={{ margin: 0 }}>2450</Title>
                  </div>
                </Space>
              </Card>
            </Col>
            <Col span={8}>
              <Card bordered={false} style={{ borderRadius: 16 }}>
                <Space size="large">
                  <Avatar shape="square" size={48} icon={<CreditCardOutlined />} style={{ background: '#f6ffed', color: '#52c41a' }} />
                  <div>
                    <Text type="secondary" block>Hóa đơn đã thanh toán</Text>
                    <Title level={2} style={{ margin: 0 }}>2</Title>
                  </div>
                </Space>
              </Card>
            </Col>
          </Row>

          {/* Booking List */}
          <Card title="Đặt phòng sắp tới" bordered={false} style={{ borderRadius: 16 }}>
             <BookingItem 
                image="https://images.unsplash.com/photo-1566073771259-6a8506099945?w=200"
                name="Phòng Deluxe Giường Đôi"
                date="2024-02-15 - 2024-02-18"
                status="Đã xác nhận"
                statusColor="success"
                price="4.500.000đ"
             />
             <Divider />
             <BookingItem 
                image="https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=200"
                name="Phòng Executive"
                date="2024-03-10 - 2024-03-12"
                status="Sắp tới"
                statusColor="processing"
                price="5.600.000đ"
                isHighlight
             />
          </Card>
        </Content>
      </Layout>

      {/* FOOTER */}
      <Footer style={{ background: COLORS.dark, color: '#fff', padding: '60px 50px' }}>
        <Row gutter={40}>
          <Col span={6}>
            <Title level={4} style={{ color: '#fff' }}>GRAND HOTEL</Title>
            <Text style={{ color: COLORS.gray }}>Hệ thống quản trị khách sạn toàn diện, mang đến trải nghiệm nghỉ dưỡng đẳng cấp.</Text>
          </Col>
          <Col span={6}>
            <Title level={5} style={{ color: '#fff' }}>Liên kết nhanh</Title>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <Link to="/homepage" style={{ color: COLORS.gray }}>Trang chủ</Link>
              <Link to="/guest/bookings" style={{ color: COLORS.gray }}>Đặt phòng</Link>
              <Link to="/guest/profile" style={{ color: COLORS.gray }}>Tài khoản</Link>
            </div>
          </Col>
          <Col span={6}>
            <Title level={5} style={{ color: '#fff' }}>Liên hệ</Title>
            <Text style={{ color: COLORS.gray }} block>📍 123 Đường Biển, Đà Nẵng</Text>
            <Text style={{ color: COLORS.gray }} block>📞 +84 236 123 4567</Text>
            <Text style={{ color: COLORS.gray }} block>✉️ info@grandhotel.vn</Text>
          </Col>
          <Col span={6}>
            <Title level={5} style={{ color: '#fff' }}>Kết nối với chúng tôi</Title>
            <Space size="large" style={{ fontSize: 20 }}>
              <FacebookFilled /> <InstagramFilled /> <TwitterOutlined /> <YoutubeFilled />
            </Space>
          </Col>
        </Row>
      </Footer>
    </Layout>
  );
};

// Component phụ cho danh sách đặt phòng
const BookingItem = ({ image, name, date, status, statusColor, price, isHighlight }) => (
  <div style={{ 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center',
    padding: '10px',
    borderRadius: 12,
    border: isHighlight ? `1px solid ${COLORS.gold}` : '1px solid transparent'
  }}>
    <Space size="large">
      <img src={image} alt="room" style={{ width: 100, height: 70, borderRadius: 8, objectFit: 'cover' }} />
      <div>
        <Text strong style={{ fontSize: 16 }}>{name}</Text>
        <div style={{ color: COLORS.gray }}><CalendarOutlined /> {date}</div>
        <Tag color={statusColor} style={{ marginTop: 5 }}>{status}</Tag>
      </div>
    </Space>
    <div style={{ textAlign: 'right' }}>
      <Title level={4} style={{ color: COLORS.gold, margin: 0 }}>{price}</Title>
      <Link to="/guest/bookings" style={{ color: COLORS.dark, fontWeight: 600 }}>Xem chi tiết →</Link>
    </div>
  </div>
);

export default GuestDashboard;