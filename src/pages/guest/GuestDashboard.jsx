import React from 'react';
import { Card, Typography, Button, List, Tag, Row, Col } from 'antd';
import { PlusOutlined, CalendarOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const GuestDashboard = () => {
  const myBookings = [
    { id: 1, room: 'Phòng Đôi Hướng Biển', checkIn: '28/03/2026', checkOut: '30/03/2026', status: 'Sắp tới', price: '1,200,000 VND' },
    { id: 2, room: 'Phòng Đơn Tiêu Chuẩn', checkIn: '15/02/2026', checkOut: '17/02/2026', status: 'Đã hoàn thành', price: '800,000 VND' },
  ];

  return (
    <div style={{ padding: 24, maxWidth: 800, margin: '0 auto' }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 24 }}>
        <Col>
          <Title level={2} style={{ margin: 0 }}>👋 Xin chào, Đỉnh!</Title>
          <Text type="secondary">Chào mừng bạn trở lại hệ thống đặt phòng.</Text>
        </Col>
        <Col>
          <Button type="primary" size="large" icon={<PlusOutlined />}>
            Đặt phòng mới
          </Button>
        </Col>
      </Row>

      <Card title="Lịch sử đặt phòng của tôi" bordered={false} style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <List
          itemLayout="horizontal"
          dataSource={myBookings}
          renderItem={item => (
            <List.Item
              actions={[<Button type="link">Xem chi tiết</Button>]}
            >
              <List.Item.Meta
                avatar={<CalendarOutlined style={{ fontSize: 32, color: '#1890ff' }} />}
                title={<span style={{ fontSize: '16px', fontWeight: 'bold' }}>{item.room}</span>}
                description={
                  <div>
                    <p style={{ margin: 0 }}>Từ: {item.checkIn} - Đến: {item.checkOut}</p>
                    <p style={{ margin: 0, fontWeight: 'bold', color: '#ff4d4f' }}>Tổng tiền: {item.price}</p>
                  </div>
                }
              />
              <Tag color={item.status === 'Sắp tới' ? 'blue' : 'green'}>{item.status}</Tag>
            </List.Item>
          )}
        />
      </Card>
    </div>
  );
};

export default GuestDashboard;