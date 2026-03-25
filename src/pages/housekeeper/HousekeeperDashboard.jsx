import React from 'react';
import { List, Card, Button, Typography, Tag, Space } from 'antd';
import { CheckOutlined, ClockCircleOutlined } from '@ant-design/icons';

const { Title } = Typography;

const HousekeeperDashboard = () => {
  const roomsToClean = [
    { id: 1, room: '101', type: 'Phòng Đơn', status: 'Cần dọn gấp', priority: 'high' },
    { id: 2, room: '205', type: 'Phòng Đôi', status: 'Dọn bình thường', priority: 'normal' },
    { id: 3, room: '304', type: 'Phòng VIP', status: 'Đang dọn', priority: 'doing' },
  ];

  return (
    <div style={{ padding: 16, maxWidth: 600, margin: '0 auto' }}>
      <Title level={3} style={{ textAlign: 'center' }}>🧹 Danh sách dọn phòng</Title>
      
      <List
        grid={{ gutter: 16, column: 1 }}
        dataSource={roomsToClean}
        renderItem={item => (
          <List.Item>
            <Card 
              title={<span style={{ fontSize: '1.2rem' }}>Phòng {item.room}</span>}
              extra={
                <Tag color={item.priority === 'high' ? 'red' : item.priority === 'doing' ? 'blue' : 'orange'}>
                  {item.status}
                </Tag>
              }
              style={{ borderRadius: 8, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
            >
              <p><strong>Loại phòng:</strong> {item.type}</p>
              <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                {item.priority === 'doing' ? (
                  <Button type="primary" size="large" icon={<CheckOutlined />} style={{ background: '#52c41a' }}>
                    Hoàn thành
                  </Button>
                ) : (
                  <Button type="primary" size="large" icon={<ClockCircleOutlined />}>
                    Bắt đầu dọn
                  </Button>
                )}
              </Space>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
};

export default HousekeeperDashboard;