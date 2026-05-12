import React, { useState, useEffect } from "react";
import { Layout, Menu, Card, Typography, Avatar, Row, Col, Tag, Space, List, Button, message, Divider } from "antd";
import { LogoutOutlined, DashboardOutlined, HistoryOutlined, FileTextOutlined, StarOutlined, SettingOutlined, CalendarOutlined, TrophyOutlined, CreditCardOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";

const { Header, Content, Sider, Footer } = Layout;
const { Title, Text } = Typography;

const COLORS = {
  gold: "#c19b4a",
  lightGold: "#fdf8ef",
  dark: "#1a1a1a",
  gray: "#8c8c8c",
  bg: "#f8f9fa"
};

const GuestDashboard = () => {
  const navigate = useNavigate();
  const [bookedRooms, setBookedRooms] = useState([]);

  const storedUser = React.useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem('user')) || {};
    } catch {
      return {};
    }
  }, []);

  const userName = storedUser?.fullName || localStorage.getItem('userName') || 'Khách';
  const userEmail = storedUser?.email || localStorage.getItem('userEmail') || 'guest@hotel.com';
  const userPoints = Number(storedUser?.points ?? localStorage.getItem(`userPoints_${userEmail}`) ?? 0);
  const computeRank = (points) => {
    if (points >= 200000) return 'Signature';
    if (points >= 100000) return 'VIP';
    if (points >= 50000) return 'Elite';
    if (points >= 20000) return 'Kim Cương';
    if (points >= 5000) return 'Bạch Kim';
    if (points >= 3000) return 'Vàng';
    if (points >= 1000) return 'Bạc';
    if (points >= 500) return 'Đồng';
    return 'Khách Mới';
  };
  const userRank = storedUser?.rank || localStorage.getItem(`userRank_${userEmail}`) || computeRank(userPoints);
  const getRankColor = (rank) => {
    switch (rank) {
      case 'Signature': return 'magenta';
      case 'VIP': return 'volcano';
      case 'Elite': return 'gold';
      case 'Kim Cương': return 'blue';
      case 'Bạch Kim': return 'purple';
      case 'Vàng': return 'orange';
      case 'Bạc': return 'cyan';
      case 'Đồng': return 'green';
      default: return 'default';
    }
  };

  useEffect(() => {
    const saved = localStorage.getItem(`guestBookedRooms_${userEmail}`);
    if (saved) {
      try {
        setBookedRooms(JSON.parse(saved));
      } catch {
        setBookedRooms([]);
      }
    } else {
      setBookedRooms([]);
    }

    if (localStorage.getItem(`userPoints_${userEmail}`) === null) {
      localStorage.setItem(`userPoints_${userEmail}`, String(userPoints));
    }
    if (!localStorage.getItem(`userRank_${userEmail}`)) {
      localStorage.setItem(`userRank_${userEmail}`, userRank);
    }
  }, [userEmail]);

  const headerMenuItems = [
    { key: '1', label: <Link to="/homepage">Trang chủ</Link> },
    { key: '2', label: <Link to="/guest/book-room">Đặt phòng</Link> },
    { key: '3', label: <Link to="/guest/profile">Tài khoản</Link> }
  ];

  const sidebarMenuItems = [
    { key: '1', icon: <DashboardOutlined />, label: <Link to="/guest/dashboard">Tổng quan</Link> },
    { key: 'book', icon: <CalendarOutlined />, label: <Link to="/guest/book-room">Đặt phòng</Link> },
    { key: '2', icon: <HistoryOutlined />, label: <Link to="/guest/bookings">Lịch sử đặt phòng</Link> },
    { key: '3', icon: <FileTextOutlined />, label: <Link to="/guest/invoices">Hóa đơn</Link> },
    { key: '4', icon: <TrophyOutlined />, label: <Link to="/guest/rank">Hạng thành viên</Link> },
    { key: '5', icon: <StarOutlined />, label: <Link to="/guest/reviews">Đánh giá của tôi</Link> },
    { key: '6', icon: <SettingOutlined />, label: <Link to="/guest/profile">Cài đặt tài khoản</Link> }
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    message.success("Đăng xuất thành công!");
    navigate("/login");
  };

  return (
    <Layout style={{ minHeight: "100vh", background: COLORS.bg }}>
      <Header style={{ background: "#fff", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "0 50px", height: "80px", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", position: "sticky", top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ width: 40, height: 40, background: COLORS.gold, borderRadius: 8, display: 'flex', justifyContent: 'center', alignItems: 'center', marginRight: 10 }}>
            <span style={{ color: '#fff', fontWeight: 'bold' }}>G</span>
          </div>
          <Title level={4} style={{ margin: 0, color: COLORS.dark, letterSpacing: '1px' }}>GRAND HOTEL</Title>
        </div>
        <Menu mode="horizontal" defaultSelectedKeys={['3']} items={headerMenuItems} style={{ border: 'none', flex: 1, justifyContent: 'center' }} />
        <Space size="middle">
          <div style={{ textAlign: 'right' }}>
            <Text strong block>{userName}</Text>
            <Tag color="gold">Khách hàng</Tag>
          </div>
          <Avatar size={45} src={`https://i.pravatar.cc/150?u=${encodeURIComponent(userEmail)}`} />
        </Space>
      </Header>

      <Layout style={{ padding: "40px 50px", background: COLORS.bg }}>
        <Sider width={280} style={{ background: 'transparent' }}>
          <Card bordered={false} style={{ borderRadius: 16, textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.03)' }}>
            <Avatar size={100} src={`https://i.pravatar.cc/150?u=${encodeURIComponent(userEmail)}`} style={{ border: `3px solid ${COLORS.gold}` }} />
            <Title level={4} style={{ marginTop: 15, marginBottom: 0 }}>{userName}</Title>
            <Text type="secondary">{userEmail}</Text>
            <div style={{ marginTop: 15 }}>
              <Tag color={getRankColor(userRank)} style={{ borderRadius: 20, padding: '2px 15px', fontWeight: 'bold' }}>🏆 {userRank}</Tag>
            </div>
            <Divider />
            <Menu mode="vertical" defaultSelectedKeys={['1']} style={{ border: 'none', textAlign: 'left' }} items={sidebarMenuItems} />
            <Button type="text" danger icon={<LogoutOutlined />} onClick={handleLogout} style={{ marginTop: 20, width: '100%', textAlign: 'left', paddingLeft: 24 }}>
              Đăng xuất
            </Button>
          </Card>
        </Sider>

        <Content style={{ paddingLeft: 40 }}>
          <Title level={2}>Chào mừng trở lại, {userName.split(' ')[0] || userName}!</Title>
          <Row gutter={24} style={{ marginBottom: 30 }}>
            <Col span={8}>
              <Card bordered={false} style={{ borderRadius: 16 }}>
                <Space size="large">
                  <Avatar shape="square" size={48} icon={<CalendarOutlined />} style={{ background: '#e6f7ff', color: '#1890ff' }} />
                  <div>
                    <Text type="secondary" block>Lượt đặt phòng</Text>
                    <Title level={2} style={{ margin: 0 }}>{bookedRooms.length}</Title>
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
                    <Title level={2} style={{ margin: 0 }}>{userPoints}</Title>
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
                    <Title level={2} style={{ margin: 0 }}>
                      {bookedRooms.filter(r => r.status === 'Đã thanh toán').length}
                    </Title>
                  </div>
                </Space>
              </Card>
            </Col>
          </Row>

          <Card title="Đặt phòng sắp tới" bordered={false} style={{ borderRadius: 16 }}>
            {bookedRooms.length === 0 ? (
              <Text>Chưa có phòng nào đang đặt. Đặt phòng để danh sách hiển thị ở đây.</Text>
            ) : (
              <List
                dataSource={bookedRooms}
                renderItem={(room) => (
                  <List.Item style={{ padding: 20, borderRadius: 16, marginBottom: 16, background: '#fff', boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
                    <List.Item.Meta
                      avatar={<img src={room.image || room.imageUrl || 'https://via.placeholder.com/100x70?text=Ảnh+phòng'} alt={room.name} style={{ width: 100, height: 70, borderRadius: 8, objectFit: 'cover', background: '#f5f5f5' }} />}
                      title={room.name}
                      description={
                        <Space size="large" split={<Divider type="vertical" />}>
                          <Text>{room.date}</Text>
                          <Text>{room.capacity} khách</Text>
                          <Text strong>{room.price}</Text>
                        </Space>
                      }
                    />
                    <Tag color="blue">{room.status}</Tag>
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Content>
      </Layout>
    </Layout>
  );
};

export default GuestDashboard;
