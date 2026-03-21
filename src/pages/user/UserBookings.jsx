import React, { useState } from 'react';
import {
  Table,
  Button,
  Tag,
  Space,
  Card,
  Row,
  Col,
  Statistic,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  message,
  InputNumber
} from 'antd';
import {
  BookOutlined,
  PlusOutlined,
  EyeOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;

const UserBookings = () => {
  const [bookings, setBookings] = useState([
    {
      id: 1,
      bookingCode: 'BK001',
      roomNumber: '101',
      roomType: 'Phòng Đơn',
      checkIn: '2024-03-20',
      checkOut: '2024-03-22',
      status: 'confirmed',
      totalPrice: 1000000,
      createdAt: '2024-03-15',
    },
    {
      id: 2,
      bookingCode: 'BK002',
      roomNumber: '205',
      roomType: 'Phòng Gia Đình',
      checkIn: '2024-03-25',
      checkOut: '2024-03-28',
      status: 'completed',
      totalPrice: 3600000,
      createdAt: '2024-03-10',
    },
    {
      id: 3,
      bookingCode: 'BK003',
      roomNumber: '102',
      roomType: 'Phòng Đôi',
      checkIn: '2024-04-01',
      checkOut: '2024-04-03',
      status: 'pending',
      totalPrice: 1600000,
      createdAt: '2024-03-20',
    },
  ]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();

  const columns = [
    {
      title: 'Mã Đặt Phòng',
      dataIndex: 'bookingCode',
      key: 'bookingCode',
      render: (code) => <strong>{code}</strong>,
    },
    {
      title: 'Phòng',
      dataIndex: 'roomNumber',
      key: 'roomNumber',
      render: (text, record) => `${text} (${record.roomType})`,
    },
    {
      title: 'Ngày Nhận Phòng',
      dataIndex: 'checkIn',
      key: 'checkIn',
    },
    {
      title: 'Ngày Trả Phòng',
      dataIndex: 'checkOut',
      key: 'checkOut',
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusMap = {
          pending: { color: '#faad14', text: 'Chờ Xác Nhận' },
          confirmed: { color: '#52c41a', text: 'Đã Xác Nhận' },
          cancelled: { color: '#f5222d', text: 'Đã Hủy' },
          completed: { color: '#1890ff', text: 'Hoàn Thành' },
        };
        const { color, text } = statusMap[status] || { color: 'default', text: status };
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: 'Tổng Tiền',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (price) => `${price.toLocaleString()} VNĐ`,
    },
    {
      title: 'Ngày Đặt',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
    {
      title: 'Hành Động',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetails(record)}
          >
            Chi Tiết
          </Button>
          {record.status === 'pending' && (
            <Button
              type="link"
              danger
              onClick={() => handleCancelBooking(record.id)}
            >
              Hủy Đặt
            </Button>
          )}
        </Space>
      ),
    },
  ];

  const handleViewDetails = (booking) => {
    Modal.info({
      title: `Chi Tiết Đặt Phòng ${booking.bookingCode}`,
      content: (
        <div>
          <p><strong>Phòng:</strong> {booking.roomNumber} ({booking.roomType})</p>
          <p><strong>Thời Gian:</strong> {booking.checkIn} đến {booking.checkOut}</p>
          <p><strong>Tổng Tiền:</strong> {booking.totalPrice.toLocaleString()} VNĐ</p>
          <p><strong>Trạng Thái:</strong> {booking.status}</p>
          <p><strong>Ngày Đặt:</strong> {booking.createdAt}</p>
        </div>
      ),
      width: 500,
    });
  };

  const handleCancelBooking = (id) => {
    Modal.confirm({
      title: 'Xác Nhận Hủy Đặt Phòng',
      content: 'Bạn có chắc muốn hủy đặt phòng này?',
      okText: 'Có',
      cancelText: 'Không',
      onOk() {
        setBookings(bookings.map(booking =>
          booking.id === id ? { ...booking, status: 'cancelled' } : booking
        ));
        message.success('Hủy đặt phòng thành công!');
      },
    });
  };

  const handleNewBooking = () => {
    setIsModalVisible(true);
  };

  const handleModalOk = () => {
    form.validateFields().then(values => {
      const [checkIn, checkOut] = values.dateRange;
      const newBooking = {
        id: Math.max(...bookings.map(b => b.id)) + 1,
        bookingCode: `BK${String(Math.max(...bookings.map(b => parseInt(b.bookingCode.slice(2)))) + 1).padStart(3, '0')}`,
        roomNumber: values.roomNumber,
        roomType: values.roomType,
        checkIn: checkIn.format('YYYY-MM-DD'),
        checkOut: checkOut.format('YYYY-MM-DD'),
        status: 'pending',
        totalPrice: values.totalPrice,
        createdAt: dayjs().format('YYYY-MM-DD'),
        dateRange: undefined,
      };

      setBookings([...bookings, newBooking]);
      message.success('Đặt phòng thành công! Vui lòng chờ xác nhận.');
      setIsModalVisible(false);
      form.resetFields();
    });
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  const getStats = () => {
    const total = bookings.length;
    const confirmed = bookings.filter(b => b.status === 'confirmed').length;
    const completed = bookings.filter(b => b.status === 'completed').length;
    const totalSpent = bookings
      .filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + b.totalPrice, 0);

    return { total, confirmed, completed, totalSpent };
  };

  const stats = getStats();

  return (
    <div>
      <h1>Lịch Sử Đặt Phòng</h1>

      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng Đặt Phòng"
              value={stats.total}
              prefix={<BookOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Đã Xác Nhận"
              value={stats.confirmed}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Hoàn Thành"
              value={stats.completed}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Tổng Chi Tiêu"
              value={stats.totalSpent}
              suffix="VNĐ"
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      <Card
        title="Danh Sách Đặt Phòng"
        extra={
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleNewBooking}
          >
            Đặt Phòng Mới
          </Button>
        }
        bordered={false}
      >
        <Table
          columns={columns}
          dataSource={bookings}
          rowKey="id"
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title="Đặt Phòng Mới"
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="roomNumber"
            label="Số Phòng"
            rules={[{ required: true, message: 'Vui lòng nhập số phòng!' }]}
          >
            <Input placeholder="Ví dụ: 101" />
          </Form.Item>

          <Form.Item
            name="roomType"
            label="Loại Phòng"
            rules={[{ required: true, message: 'Vui lòng chọn loại phòng!' }]}
          >
            <Select placeholder="Chọn loại phòng">
              <Option value="Phòng Đơn">Phòng Đơn</Option>
              <Option value="Phòng Đôi">Phòng Đôi</Option>
              <Option value="Phòng Gia Đình">Phòng Gia Đình</Option>
              <Option value="Phòng Suite">Phòng Suite</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="dateRange"
            label="Thời Gian Ở"
            rules={[{ required: true, message: 'Vui lòng chọn thời gian!' }]}
          >
            <RangePicker
              style={{ width: '100%' }}
              placeholder={['Ngày nhận phòng', 'Ngày trả phòng']}
            />
          </Form.Item>

          <Form.Item
            name="totalPrice"
            label="Tổng Tiền (VNĐ)"
            rules={[{ required: true, message: 'Vui lòng nhập tổng tiền!' }]}
          >
            <InputNumber
              min={0}
              step={50000}
              style={{ width: '100%' }}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserBookings;