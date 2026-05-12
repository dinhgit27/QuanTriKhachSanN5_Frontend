import React from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Button, Typography, Space } from 'antd';
import { KeyOutlined, CheckCircleOutlined, SyncOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

const ReceptionistDashboard = () => {
  // Dữ liệu mẫu (Mốt ní nối API vào đây)
  const navigate = useNavigate();
  const todayBookings = [
    { id: 1, guest: 'Nguyễn Văn A', room: '101', type: 'Check-in', time: '14:00', status: 'Chờ nhận phòng' },
    { id: 2, guest: 'Trần Thị B', room: '205', type: 'Check-out', time: '12:00', status: 'Đã thanh toán' },
    { id: 3, guest: 'Lê Hoàng C', room: '302', type: 'Check-in', time: '15:30', status: 'Chờ nhận phòng' },
  ];

  const columns = [
    { title: 'Khách hàng', dataIndex: 'guest', key: 'guest', render: text => <a>{text}</a> },
    { title: 'Phòng', dataIndex: 'room', key: 'room' },
    { title: 'Loại', dataIndex: 'type', key: 'type', render: type => <Tag color={type === 'Check-in' ? 'blue' : 'orange'}>{type}</Tag> },
    { title: 'Thời gian', dataIndex: 'time', key: 'time' },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status' },
    {
      title: 'Thao tác', key: 'action', render: (_, record) => (
        <Button type="primary" size="small" icon={record.type === 'Check-in' ? <KeyOutlined /> : <CheckCircleOutlined />}>
          {record.type === 'Check-in' ? 'Nhận phòng' : 'Trả phòng'}
        </Button>
      )
    },
  ];
  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>🛎️ Tổng quan Lễ Tân</Title>
      <Button
        type="primary"
        style={{ marginBottom: 16 }}
        onClick={() => navigate("/receptionist/invoice-draft")}
      >
        Tạo hóa đơn
      </Button>

      {/* Các thẻ thống kê nhanh */}
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card bordered={false} style={{ background: '#e6f7ff' }}>
            <Statistic title="Phòng Trống" value={15} prefix={<CheckCircleOutlined />} valueStyle={{ color: '#1890ff' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false} style={{ background: '#fff1f0' }}>
            <Statistic title="Đang Có Khách" value={28} prefix={<UserOutlined />} valueStyle={{ color: '#cf1322' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false} style={{ background: '#fffbe6' }}>
            <Statistic title="Chưa Dọn Dẹp" value={5} prefix={<SyncOutlined spin />} valueStyle={{ color: '#faad14' }} />
          </Card>
        </Col>
        <Col span={6}>
          <Card bordered={false} style={{ background: '#f6ffed' }}>
            <Statistic title="Lượt Check-in Hôm Nay" value={12} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
      </Row>

      {/* Bảng công việc hôm nay */}
      <Card title="Lịch trình Check-in / Check-out hôm nay" bordered={false}>
        <Table columns={columns} dataSource={todayBookings} rowKey="id" pagination={false} />
      </Card>
    </div>
  );
};

export default ReceptionistDashboard;