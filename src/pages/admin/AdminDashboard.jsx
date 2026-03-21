import React from 'react';
import { Row, Col, Card, Statistic, Progress } from 'antd';
import {
  HomeOutlined,
  BookOutlined,
  UserOutlined,
  TeamOutlined,
  DollarOutlined
} from '@ant-design/icons';

const AdminDashboard = () => {
  return (
    <div>
      <h1>Dashboard Admin</h1>

      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng Phòng"
              value={50}
              prefix={<HomeOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Phòng Trống"
              value={32}
              prefix={<HomeOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Đặt Phòng Hôm Nay"
              value={8}
              prefix={<BookOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng Doanh Thu"
              value={125000000}
              prefix={<DollarOutlined />}
              suffix="VNĐ"
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card title="Tỷ Lệ Lấp Đầy Phòng" bordered={false}>
            <Progress
              type="circle"
              percent={64}
              format={(percent) => `${percent}%`}
              strokeColor={{
                '0%': '#108ee9',
                '100%': '#87d068',
              }}
            />
            <p style={{ textAlign: 'center', marginTop: '16px' }}>
              32/50 phòng đã được đặt
            </p>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Thống Kê Khách Hàng" bordered={false}>
            <Row gutter={[16, 8]}>
              <Col span={12}>
                <Statistic
                  title="Khách Hàng Mới"
                  value={25}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </Col>
              <Col span={12}>
                <Statistic
                  title="Nhân Viên"
                  value={12}
                  prefix={<TeamOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </Col>
            </Row>
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        <Col xs={24}>
          <Card title="Hoạt Động Gần Đây" bordered={false}>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              <div style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                <strong>10:30</strong> - Phòng 101 đã được đặt bởi Nguyễn Văn A
              </div>
              <div style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                <strong>09:15</strong> - Phòng 205 đã được trả bởi Trần Thị B
              </div>
              <div style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                <strong>08:45</strong> - Khách hàng mới: Lê Văn C đã đăng ký
              </div>
              <div style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                <strong>08:00</strong> - Nhân viên D đã check-in cho phòng 303
              </div>
              <div style={{ padding: '8px 0' }}>
                <strong>07:30</strong> - Hệ thống khởi động thành công
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboard;