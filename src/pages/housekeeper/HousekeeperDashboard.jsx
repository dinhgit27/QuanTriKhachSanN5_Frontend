import React, { useState } from "react";
import {
  Button,
  Card,
  Typography,
  message,
  Table,
  Tag,
  Row,
  Col,
  Statistic,
  Space,
} from "antd";
import {
  LogoutOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  ToolOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";

const { Title } = Typography;

const HousekeeperDashboard = () => {
  const navigate = useNavigate();

  // Dữ liệu mẫu (sau này sẽ thay bằng API)
  const initialRoomTasks = [
    { key: '1', room: '101', status: 'Cần dọn', priority: 'Cao', notes: 'Khách vừa check-out' },
    { key: '2', room: '102', status: 'Đang dọn', priority: 'Thường', notes: '' },
    { key: '3', room: '205', status: 'Cần dọn', priority: 'Thường', notes: 'Khách yêu cầu dọn phòng' },
    { key: '4', room: '301', status: 'Đã dọn', priority: 'Thường', notes: '' },
    { key: '5', room: '302', status: 'Cần dọn', priority: 'Cao', notes: 'Phòng VIP, khách sắp check-in' },
    { key: '6', room: '404', status: 'Cần kiểm tra', priority: 'Thấp', notes: 'Báo hỏng vòi nước' },
  ];

  const [tasks, setTasks] = useState(initialRoomTasks);

  const handleLogout = () => {
    localStorage.removeItem("token");
    message.success("Đăng xuất thành công!");
    navigate("/login");
  };

  const handleUpdateStatus = (key, newStatus) => {
    setTasks(tasks.map(task =>
      task.key === key ? { ...task, status: newStatus } : task
    ));
    message.success(`Phòng ${tasks.find(t => t.key === key).room} đã được cập nhật!`);
  };

  const columns = [
    { title: 'Phòng', dataIndex: 'room', key: 'room', render: text => <strong>{text}</strong> },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      render: status => {
        let color;
        if (status === 'Cần dọn') color = 'red';
        else if (status === 'Đang dọn') color = 'blue';
        else if (status === 'Đã dọn') color = 'green';
        else color = 'gold';
        return <Tag color={color}>{status.toUpperCase()}</Tag>;
      }
    },
    {
      title: 'Ưu tiên',
      dataIndex: 'priority',
      key: 'priority',
      render: priority => <Tag color={priority === 'Cao' ? 'magenta' : 'default'}>{priority}</Tag>
    },
    { title: 'Ghi chú', dataIndex: 'notes', key: 'notes' },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          {record.status === 'Cần dọn' && (
            <Button type="primary" size="small" onClick={() => handleUpdateStatus(record.key, 'Đang dọn')}>Bắt đầu dọn</Button>
          )}
          {record.status === 'Đang dọn' && (
            <Button type="primary" size="small" style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }} onClick={() => handleUpdateStatus(record.key, 'Đã dọn')}>Hoàn thành</Button>
          )}
        </Space>
      ),
    },
  ];

  const roomsToClean = tasks.filter(t => t.status === 'Cần dọn').length;
  const roomsCleaned = tasks.filter(t => t.status === 'Đã dọn').length;
  const roomsInProgress = tasks.filter(t => t.status === 'Đang dọn').length;

  return (
    <div style={{ padding: '24px', background: '#f0f2f5', minHeight: '100vh' }}>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <Title level={2} style={{ margin: 0 }}>🧹 Bảng điều khiển Dọn phòng</Title>
          <Button type="primary" danger icon={<LogoutOutlined />} onClick={handleLogout}>
            Đăng xuất
          </Button>
        </div>

        {/* Thống kê nhanh */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col xs={24} sm={8}>
            <Card bordered={false} style={{ background: '#fff1f0' }}>
              <Statistic title="Phòng cần dọn" value={roomsToClean} prefix={<ToolOutlined />} valueStyle={{ color: '#cf1322' }} />
            </Card>
          </Col>
          <Col xs={24} sm={8} style={{ margin: '16px 0' }}>
            <Card bordered={false} style={{ background: '#e6f7ff' }}>
              <Statistic title="Phòng đang dọn" value={roomsInProgress} prefix={<SyncOutlined spin />} valueStyle={{ color: '#1890ff' }} />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card bordered={false} style={{ background: '#f6ffed' }}>
              <Statistic title="Phòng đã dọn" value={roomsCleaned} prefix={<CheckCircleOutlined />} valueStyle={{ color: '#52c41a' }} />
            </Card>
          </Col>
        </Row>

        {/* Bảng công việc */}
        <Card title="Danh sách công việc hôm nay" bordered={false}>
          <Table columns={columns} dataSource={tasks} rowKey="key" scroll={{ x: true }} />
        </Card>
      </Card>
    </div>
  );
};

export default HousekeeperDashboard;