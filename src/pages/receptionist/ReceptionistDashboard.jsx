import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Statistic, Table, Tag, Button, Typography, Space, Input, Select, Modal, Form, message, DatePicker } from 'antd';
import { KeyOutlined, CheckCircleOutlined, SyncOutlined, UserOutlined, PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, CalendarOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const ReceptionistDashboard = () => {
  const [loading, setLoading] = useState(false);
  const [bookings, setBookings] = useState([]);
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState(null);
  const [filterStatus, setFilterStatus] = useState(null);
  const [filterDate, setFilterDate] = useState(null);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();

  // Dữ liệu mẫu (sau này sẽ nối API)
  const mockStats = {
    availableRooms: 15,
    occupiedRooms: 28,
    dirtyRooms: 5,
    todayCheckins: 12
  };

  const mockBookings = [
    { id: 1, guest: 'Nguyễn Văn A', room: '101', type: 'Check-in', time: '14:00', status: 'Chờ nhận phòng', email: 'nguyenvana@example.com', phone: '0123456789', date: '2025-01-15' },
    { id: 2, guest: 'Trần Thị B', room: '205', type: 'Check-out', time: '12:00', status: 'Đã thanh toán', email: 'tranthib@example.com', phone: '0987654321', date: '2025-01-15' },
    { id: 3, guest: 'Lê Hoàng C', room: '302', type: 'Check-in', time: '15:30', status: 'Chờ nhận phòng', email: 'lehoangc@example.com', phone: '0123987654', date: '2025-01-16' },
    { id: 4, guest: 'Phạm Thị D', room: '401', type: 'Check-out', time: '11:00', status: 'Chờ thanh toán', email: 'phamthid@example.com', phone: '0369874512', date: '2025-01-16' },
    { id: 5, guest: 'Hoàng Văn E', room: '502', type: 'Check-in', time: '16:00', status: 'Đã nhận phòng', email: 'hoangvane@example.com', phone: '0932145678', date: '2025-01-17' },
    { id: 6, guest: 'Vũ Thị F', room: '102', type: 'Check-in', time: '10:00', status: 'Chờ nhận phòng', email: 'vuthif@example.com', phone: '0123456780', date: '2025-01-17' },
    { id: 7, guest: 'Đặng Văn G', room: '203', type: 'Check-out', time: '13:00', status: 'Đã thanh toán', email: 'dangvang@example.com', phone: '0987654320', date: '2025-01-18' },
    { id: 8, guest: 'Bùi Thị H', room: '304', type: 'Check-in', time: '17:00', status: 'Chờ nhận phòng', email: 'buithih@example.com', phone: '0123987650', date: '2025-01-18' },
  ];

  useEffect(() => {
    setBookings(mockBookings);
  }, []);

  // Bộ lọc
  const filteredBookings = bookings.filter((booking) => {
    const matchSearch = 
      (booking.guest && booking.guest.toLowerCase().includes(searchText.toLowerCase())) ||
      (booking.room && booking.room.toLowerCase().includes(searchText.toLowerCase())) ||
      (booking.email && booking.email.toLowerCase().includes(searchText.toLowerCase()));

    let matchType = true;
    if (filterType) {
      matchType = booking.type === filterType;
    }

    let matchStatus = true;
    if (filterStatus) {
      matchStatus = booking.status === filterStatus;
    }

    let matchDate = true;
    if (filterDate && filterDate.length === 2) {
      const startDate = filterDate[0].format('YYYY-MM-DD');
      const endDate = filterDate[1].format('YYYY-MM-DD');
      const bookingDate = booking.date;
      matchDate = bookingDate >= startDate && bookingDate <= endDate;
    }

    return matchSearch && matchType && matchStatus && matchDate;
  });

  const handleTableChange = (pag) => setPagination({ current: pag.current, pageSize: pag.pageSize });

  const handleAddNew = () => {
    setEditingId(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (booking) => {
    setEditingId(booking.id);
    form.setFieldsValue({
      guest: booking.guest,
      room: booking.room,
      type: booking.type,
      time: booking.time,
      status: booking.status,
      email: booking.email,
      phone: booking.phone,
      date: booking.date
    });
    setModalVisible(true);
  };

  const handleDelete = (booking) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: `Bạn có chắc chắn muốn xóa lịch trình này của khách ${booking.guest}?`,
      okText: 'Đồng ý',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: () => {
        setBookings(bookings.filter(b => b.id !== booking.id));
        message.success('Xóa lịch trình thành công!');
      }
    });
  };

  const handleSubmitForm = async (values) => {
    try {
      setLoading(true);
      if (editingId) {
        setBookings(bookings.map(b => b.id === editingId ? { ...b, ...values } : b));
        message.success('Cập nhật lịch trình thành công!');
      } else {
        const newBooking = { id: Date.now(), ...values };
        setBookings([...bookings, newBooking]);
        message.success('Thêm lịch trình thành công!');
      }
      setModalVisible(false);
    } catch (error) {
      message.error('Lỗi: ' + (error.response?.data?.message || error.message));
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: '#', key: 'index', render: (_, __, index) => (pagination.current - 1) * pagination.pageSize + index + 1, width: 60 },
    { title: 'Ngày', dataIndex: 'date', key: 'date', render: date => date },
    { title: 'Khách hàng', dataIndex: 'guest', key: 'guest', ellipsis: true },
    { title: 'Phòng', dataIndex: 'room', key: 'room' },
    { title: 'Loại', dataIndex: 'type', key: 'type', render: type => <Tag color={type === 'Check-in' ? 'blue' : 'orange'}>{type}</Tag> },
    { title: 'Thời gian', dataIndex: 'time', key: 'time' },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: status => <Tag color={status.includes('Chờ') ? 'gold' : status.includes('Đã') ? 'green' : 'red'}>{status}</Tag> },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Điện thoại', dataIndex: 'phone', key: 'phone' },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 220,
      render: (_, booking) => (
        <Space size="small">
          <Button type="primary" size="small" icon={booking.type === 'Check-in' ? <KeyOutlined /> : <CheckCircleOutlined />}>
            {booking.type === 'Check-in' ? 'Nhận phòng' : 'Trả phòng'}
          </Button>
          <Button icon={<EditOutlined />} size="small" onClick={() => handleEdit(booking)}>Sửa</Button>
          <Button danger icon={<DeleteOutlined />} size="small" onClick={() => handleDelete(booking)}>Xóa</Button>
        </Space>
      ),
    },
  ];

  const paginatedData = filteredBookings.slice((pagination.current - 1) * pagination.pageSize, pagination.current * pagination.pageSize);

  return (
    <>
      <Title level={2}>🛎️ Tổng quan Lễ Tân</Title>
      
      {/* Các thẻ thống kê nhanh */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ background: '#e6f7ff' }}>
            <Statistic title="Phòng Trống" value={mockStats.availableRooms} prefix={<CheckCircleOutlined />} valueStyle={{ color: '#1890ff' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ background: '#fff1f0' }}>
            <Statistic title="Đang Có Khách" value={mockStats.occupiedRooms} prefix={<UserOutlined />} valueStyle={{ color: '#cf1322' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ background: '#fffbe6' }}>
            <Statistic title="Chưa Dọn Dẹp" value={mockStats.dirtyRooms} prefix={<SyncOutlined spin />} valueStyle={{ color: '#faad14' }} />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card bordered={false} style={{ background: '#f6ffed' }}>
            <Statistic title="Lượt Check-in Hôm Nay" value={mockStats.todayCheckins} valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
      </Row>

      {/* Bộ lọc và nút Thêm mới */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24, display: 'flex', alignItems: 'center' }}>
        <Col xs={24} sm={12} lg={6}>
          <Input.Search placeholder="Tìm theo tên, phòng, email..." allowClear onChange={(e) => setSearchText(e.target.value)} />
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Select placeholder="Tất cả loại" style={{ width: '100%' }} onChange={(v) => setFilterType(v)} allowClear>
            <Option value="Check-in">Check-in</Option>
            <Option value="Check-out">Check-out</Option>
          </Select>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Select placeholder="Tất cả trạng thái" style={{ width: '100%' }} onChange={(v) => setFilterStatus(v)} allowClear>
            <Option value="Chờ nhận phòng">Chờ nhận phòng</Option>
            <Option value="Chờ thanh toán">Chờ thanh toán</Option>
            <Option value="Đã nhận phòng">Đã nhận phòng</Option>
            <Option value="Đã thanh toán">Đã thanh toán</Option>
          </Select>
        </Col>
        <Col xs={24} sm={12} lg={5}>
          <RangePicker 
            style={{ width: '100%' }} 
            placeholder={['Từ ngày', 'Đến ngày']} 
            onChange={(dates) => setFilterDate(dates)}
            suffixIcon={<CalendarOutlined />}
          />
        </Col>
        <Col xs={24} sm={12} lg={5} style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddNew}>Thêm lịch trình</Button>
        </Col>
      </Row>

      {/* Bảng công việc hôm nay */}
      <Table 
        columns={columns} 
        dataSource={paginatedData} 
        loading={loading} 
        pagination={false} 
        rowKey="id" 
        scroll={{ x: 'max-content' }} 
        size="middle" 
      />

      {filteredBookings.length > 0 && (
        <Row justify="end" style={{ marginTop: 16 }}>
          <Pagination 
            current={pagination.current} 
            pageSize={pagination.pageSize} 
            total={filteredBookings.length} 
            showSizeChanger 
            showQuickJumper 
            onChange={(current, pageSize) => handleTableChange({ current, pageSize })} 
          />
        </Row>
      )}

      {/* Modal dùng chung cho cả Thêm và Sửa */}
      <Modal 
        title={editingId ? "Cập nhật Lịch trình" : "Thêm Lịch trình mới"} 
        open={modalVisible} 
        onCancel={() => setModalVisible(false)} 
        footer={null} 
        width={800} 
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmitForm}>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="date" label="Ngày" rules={[{ required: true, message: 'Vui lòng chọn ngày!' }]}>
                <DatePicker style={{ width: '100%' }} placeholder="Chọn ngày" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="guest" label="Họ và tên khách" rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}>
                <Input placeholder="Nguyễn Văn A" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="room" label="Số phòng" rules={[{ required: true, message: 'Vui lòng nhập số phòng!' }]}>
                <Input placeholder="101" />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={8}>
              <Form.Item name="type" label="Loại" rules={[{ required: true, message: 'Vui lòng chọn loại!' }]}>
                <Select placeholder="Chọn loại">
                  <Option value="Check-in">Check-in</Option>
                  <Option value="Check-out">Check-out</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="time" label="Thời gian" rules={[{ required: true, message: 'Vui lòng nhập thời gian!' }]}>
                <Input placeholder="14:00" />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="status" label="Trạng thái" rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}>
                <Select placeholder="Chọn trạng thái">
                  <Option value="Chờ nhận phòng">Chờ nhận phòng</Option>
                  <Option value="Chờ thanh toán">Chờ thanh toán</Option>
                  <Option value="Đã nhận phòng">Đã nhận phòng</Option>
                  <Option value="Đã thanh toán">Đã thanh toán</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="email" label="Email">
                <Input placeholder="example@domain.com" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="phone" label="Số điện thoại">
                <Input placeholder="0123456789" />
              </Form.Item>
            </Col>
          </Row>
          
          <Form.Item>
            <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button onClick={() => setModalVisible(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                {editingId ? "Cập nhật" : "Tạo lịch trình"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default ReceptionistDashboard;
