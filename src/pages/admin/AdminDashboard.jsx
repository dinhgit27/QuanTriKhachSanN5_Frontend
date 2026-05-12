import React, { useState, useEffect } from 'react';
import { Layout, Menu, Card, Row, Col, Statistic, Table, Tag, Button, Typography, Space, DatePicker, Select, Input, Modal, Form, message, Badge, Tooltip, Tabs, List, Avatar, Drawer, Spin, Alert } from 'antd';
import { KeyOutlined, CheckCircleOutlined, SyncOutlined, UserOutlined, CalendarOutlined, SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, DollarOutlined, ClockCircleOutlined, HomeOutlined, FileTextOutlined, UserAddOutlined, SettingOutlined, BellOutlined, AppstoreOutlined, CheckOutlined, CloseCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import moment from 'moment';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { TabPane } = Tabs;
const { Header, Sider, Content } = Layout;

const AdminDashboard = () => {
  // State quản lý dữ liệu
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('room-map');
  const [collapsed, setCollapsed] = useState(false);
  const [stats, setStats] = useState({
    availableRooms: 0,
    occupiedRooms: 0,
    dirtyRooms: 0,
    todayCheckins: 0,
    todayCheckouts: 0,
    revenueToday: 0
  });
  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [guests, setGuests] = useState([]);
  const [services, setServices] = useState([]);
  const [searchParams, setSearchParams] = useState({
    dateRange: [moment().startOf('day'), moment().endOf('day')],
    roomType: 'all',
    status: 'all'
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [serviceModalVisible, setServiceModalVisible] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [form] = Form.useForm();
  const [serviceForm] = Form.useForm();

  // Dữ liệu mẫu (sẽ thay bằng API)
  useEffect(() => {
    // Mock data
    const mockRooms = [
      { id: 1, number: '101', type: 'Standard', status: 'available', price: 500000, floor: 1 },
      { id: 2, number: '102', type: 'Standard', status: 'occupied', price: 500000, floor: 1 },
      { id: 3, number: '103', type: 'Standard', status: 'dirty', price: 500000, floor: 1 },
      { id: 4, number: '201', type: 'Deluxe', status: 'available', price: 800000, floor: 2 },
      { id: 5, number: '202', type: 'Deluxe', status: 'occupied', price: 800000, floor: 2 },
      { id: 6, number: '203', type: 'Deluxe', status: 'available', price: 800000, floor: 2 },
      { id: 7, number: '301', type: 'Suite', status: 'available', price: 1200000, floor: 3 },
      { id: 8, number: '302', type: 'Suite', status: 'dirty', price: 1200000, floor: 3 },
      { id: 9, number: '303', type: 'Suite', status: 'occupied', price: 1200000, floor: 3 },
      { id: 10, number: '401', type: 'Family', status: 'available', price: 1500000, floor: 4 },
      { id: 11, number: '402', type: 'Family', status: 'available', price: 1500000, floor: 4 },
      { id: 12, number: '403', type: 'Family', status: 'occupied', price: 1500000, floor: 4 },
    ];

    const mockBookings = [
      { 
        id: 1, 
        guestName: 'Nguyễn Văn A', 
        guestPhone: '0912345678',
        guestIdCard: '012345678901',
        roomNumber: '102', 
        roomType: 'Standard',
        checkInTime: moment().subtract(2, 'hours'),
        checkOutTime: moment().add(1, 'day'),
        status: 'checked_in',
        paymentStatus: 'paid',
        totalAmount: 1000000,
        bookingType: 'online'
      },
      { 
        id: 2, 
        guestName: 'Trần Thị B', 
        guestPhone: '0987654321',
        guestIdCard: '098765432109',
        roomNumber: '202', 
        roomType: 'Deluxe',
        checkInTime: moment().subtract(1, 'day'),
        checkOutTime: moment(),
        status: 'checked_out',
        paymentStatus: 'paid',
        totalAmount: 1600000,
        bookingType: 'walk_in'
      },
      { 
        id: 3, 
        guestName: 'Lê Hoàng C', 
        guestPhone: '0934567890',
        guestIdCard: '034567890123',
        roomNumber: '303', 
        roomType: 'Suite',
        checkInTime: moment().subtract(3, 'hours'),
        checkOutTime: moment().add(2, 'days'),
        status: 'checked_in',
        paymentStatus: 'pending',
        totalAmount: 1500000,
        bookingType: 'online'
      },
      { 
        id: 4, 
        guestName: 'Phạm Thị D', 
        guestPhone: '0978901234',
        guestIdCard: '078901234567',
        roomNumber: '403', 
        roomType: 'Family',
        checkInTime: moment().subtract(1, 'day'),
        checkOutTime: moment().add(1, 'day'),
        status: 'checked_in',
        paymentStatus: 'paid',
        totalAmount: 3000000,
        bookingType: 'online'
      },
    ];

    const mockGuests = [
      { id: 1, name: 'Nguyễn Văn A', phone: '0912345678', idCard: '012345678901', isRegular: true, bookingCount: 5, totalSpent: 7500000 },
      { id: 2, name: 'Trần Thị B', phone: '0987654321', idCard: '098765432109', isRegular: false, bookingCount: 1, totalSpent: 1600000 },
      { id: 3, name: 'Lê Hoàng C', phone: '0934567890', idCard: '034567890123', isRegular: false, bookingCount: 1, totalSpent: 1500000 },
      { id: 4, name: 'Phạm Thị D', phone: '0978901234', idCard: '078901234567', isRegular: true, bookingCount: 3, totalSpent: 4200000 },
    ];

    const mockServices = [
      { id: 1, name: 'Dọn phòng nhanh', category: 'Dọn dẹp', price: 100000, unit: 'Phòng' },
      { id: 2, name: 'Giặt ủi', category: 'Dịch vụ', price: 50000, unit: 'Món' },
      { id: 3, name: 'Đưa đón sân bay', category: 'Di chuyển', price: 200000, unit: 'Chuyến' },
      { id: 4, name: 'Nước suối', category: 'Mini bar', price: 20000, unit: 'Chai' },
      { id: 5, name: 'Cà phê', category: 'Mini bar', price: 30000, unit: 'Ly' },
    ];

    setRooms(mockRooms);
    setBookings(mockBookings);
    setGuests(mockGuests);
    setServices(mockServices);
    
    // Tính toán thống kê
    const available = mockRooms.filter(r => r.status === 'available').length;
    const occupied = mockRooms.filter(r => r.status === 'occupied').length;
    const dirty = mockRooms.filter(r => r.status === 'dirty').length;
    const todayCheckins = mockBookings.filter(b => moment(b.checkInTime).isSame(moment(), 'day')).length;
    const todayCheckouts = mockBookings.filter(b => moment(b.checkOutTime).isSame(moment(), 'day')).length;
    const revenueToday = mockBookings
      .filter(b => moment(b.checkOutTime).isSame(moment(), 'day'))
      .reduce((sum, b) => sum + b.totalAmount, 0);

    setStats({
      availableRooms: available,
      occupiedRooms: occupied,
      dirtyRooms: dirty,
      todayCheckins,
      todayCheckouts,
      revenueToday
    });
  }, []);

  // Cập nhật thống kê khi thay đổi dữ liệu
  useEffect(() => {
    const available = rooms.filter(r => r.status === 'available').length;
    const occupied = rooms.filter(r => r.status === 'occupied').length;
    const dirty = rooms.filter(r => r.status === 'dirty').length;
    const todayCheckins = bookings.filter(b => moment(b.checkInTime).isSame(moment(), 'day')).length;
    const todayCheckouts = bookings.filter(b => moment(b.checkOutTime).isSame(moment(), 'day')).length;
    const revenueToday = bookings
      .filter(b => moment(b.checkOutTime).isSame(moment(), 'day'))
      .reduce((sum, b) => sum + b.totalAmount, 0);

    setStats({
      availableRooms: available,
      occupiedRooms: occupied,
      dirtyRooms: dirty,
      todayCheckins,
      todayCheckouts,
      revenueToday
    });
  }, [rooms, bookings]);

  // Xử lý nhận phòng
  const handleCheckIn = async (bookingId) => {
    setLoading(true);
    try {
      // Cập nhật trạng thái booking
      setBookings(prev => prev.map(b => 
        b.id === bookingId ? { ...b, status: 'checked_in' } : b
      ));
      
      // Cập nhật trạng thái phòng
      const booking = bookings.find(b => b.id === bookingId);
      setRooms(prev => prev.map(r => 
        r.number === booking?.roomNumber 
          ? { ...r, status: 'occupied' } 
          : r
      ));
      
      message.success('Nhận phòng thành công!');
    } catch (error) {
      message.error('Có lỗi xảy ra khi nhận phòng');
    } finally {
      setLoading(false);
    }
  };

  // Xử lý trả phòng
  const handleCheckOut = async (bookingId) => {
    setLoading(true);
    try {
      // Cập nhật trạng thái booking
      setBookings(prev => prev.map(b => 
        b.id === bookingId ? { ...b, status: 'checked_out' } : b
      ));
      
      // Cập nhật trạng thái phòng
      const booking = bookings.find(b => b.id === bookingId);
      setRooms(prev => prev.map(r => 
        r.number === booking?.roomNumber 
          ? { ...r, status: 'dirty' } 
          : r
      ));
      
      message.success('Trả phòng thành công!');
    } catch (error) {
      message.error('Có lỗi xảy ra khi trả phòng');
    } finally {
      setLoading(false);
    }
  };

  // Xử lý thanh toán
  const handlePayment = async (bookingId) => {
    setLoading(true);
    try {
      setBookings(prev => prev.map(b => 
        b.id === bookingId ? { ...b, paymentStatus: 'paid' } : b
      ));
      message.success('Thanh toán thành công!');
    } catch (error) {
      message.error('Có lỗi xảy ra khi thanh toán');
    } finally {
      setLoading(false);
    }
  };

  // Xử lý đặt phòng mới
  const handleNewBooking = async () => {
    try {
      const values = await form.validateFields();
      const newBooking = {
        id: bookings.length + 1,
        guestName: values.guestName,
        guestPhone: values.guestPhone,
        guestIdCard: values.guestIdCard,
        roomNumber: values.roomNumber,
        roomType: rooms.find(r => r.number === values.roomNumber)?.type || 'Standard',
        checkInTime: values.checkInTime.toDate(),
        checkOutTime: values.checkOutTime.toDate(),
        status: 'pending',
        paymentStatus: 'pending',
        totalAmount: rooms.find(r => r.number === values.roomNumber)?.price || 500000,
        bookingType: 'walk_in'
      };
      
      setBookings(prev => [...prev, newBooking]);
      setModalVisible(false);
      form.resetFields();
      message.success('Đặt phòng thành công!');
    } catch (error) {
      message.error('Có lỗi xảy ra khi đặt phòng');
    }
  };

  // Xử lý dịch vụ phát sinh
  const handleAddService = async () => {
    try {
      const values = await serviceForm.validateFields();
      message.success('Thêm dịch vụ thành công!');
      setServiceModalVisible(false);
      serviceForm.resetFields();
    } catch (error) {
      message.error('Có lỗi xảy ra khi thêm dịch vụ');
    }
  };

  // Render Room Map (Sơ đồ phòng)
  const renderRoomMap = () => {
    const floors = [1, 2, 3, 4];
    
    const getStatusColor = (status) => {
      switch (status) {
        case 'available': return '#52c41a';
        case 'occupied': return '#ff4d4f';
        case 'dirty': return '#faad14';
        default: return '#d9d9d9';
      }
    };

    const getStatusText = (status) => {
      switch (status) {
        case 'available': return 'Trống';
        case 'occupied': return 'Có khách';
        case 'dirty': return 'Chưa dọn';
        default: return 'Không xác định';
      }
    };

    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <Title level={3}>🗺️ Sơ Đồ Phòng</Title>
          <div style={{ display: 'flex', gap: 12 }}>
            <Button type="primary" icon={<PlusOutlined />}>
              Đặt Phòng Mới
            </Button>
            <Button icon={<CalendarOutlined />}>
              Lịch Phòng
            </Button>
          </div>
        </div>

        {/* Thống kê nhanh */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={4}>
            <Card bordered={false} style={{ background: '#f6ffed' }}>
              <Statistic 
                title="Phòng Trống" 
                value={stats.availableRooms} 
                prefix={<CheckCircleOutlined style={{ color: '#52c41a' }} />} 
                valueStyle={{ color: '#52c41a' }} 
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card bordered={false} style={{ background: '#fff1f0' }}>
              <Statistic 
                title="Đang Có Khách" 
                value={stats.occupiedRooms} 
                prefix={<UserOutlined style={{ color: '#ff4d4f' }} />} 
                valueStyle={{ color: '#ff4d4f' }} 
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card bordered={false} style={{ background: '#fffbe6' }}>
              <Statistic 
                title="Chưa Dọn Dẹp" 
                value={stats.dirtyRooms} 
                prefix={<SyncOutlined spin style={{ color: '#faad14' }} />} 
                valueStyle={{ color: '#faad14' }} 
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card bordered={false} style={{ background: '#e6f7ff' }}>
              <Statistic 
                title="Tổng Số Phòng" 
                value={rooms.length} 
                prefix={<HomeOutlined style={{ color: '#1890ff' }} />} 
                valueStyle={{ color: '#1890ff' }} 
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card bordered={false} style={{ background: '#f9f0ff' }}>
              <Statistic 
                title="Doanh Thu Hôm Nay" 
                value={stats.revenueToday} 
                prefix={<DollarOutlined style={{ color: '#722ed1' }} />}
                formatter={(value) => `${value.toLocaleString()}đ`}
                valueStyle={{ color: '#722ed1' }} 
              />
            </Card>
          </Col>
          <Col span={4}>
            <Card bordered={false} style={{ background: '#f0f5ff' }}>
              <Statistic 
                title="Công Việc Hôm Nay" 
                value={stats.todayCheckins + stats.todayCheckouts} 
                prefix={<BellOutlined style={{ color: '#1890ff' }} />} 
                valueStyle={{ color: '#1890ff' }} 
              />
            </Card>
          </Col>
        </Row>

        {/* Sơ đồ các tầng */}
        {floors.map(floor => (
          <Card 
            key={floor} 
            title={`Tầng ${floor}`} 
            style={{ marginBottom: 24 }}
            extra={
              <Space>
                <Tag color="green">Trống</Tag>
                <Tag color="red">Có khách</Tag>
                <Tag color="orange">Chưa dọn</Tag>
              </Space>
            }
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
              {rooms.filter(room => room.floor === floor).map(room => (
                <div 
                  key={room.id}
                  style={{
                    border: '2px solid',
                    borderColor: getStatusColor(room.status),
                    borderRadius: 8,
                    padding: 16,
                    textAlign: 'center',
                    cursor: 'pointer',
                    backgroundColor: room.status === 'available' ? '#f6ffed' : room.status === 'occupied' ? '#fff1f0' : '#fffbe6',
                    transition: 'all 0.3s',
                    position: 'relative'
                  }}
                  onClick={() => setSelectedRoom(room)}
                >
                  <div style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 8 }}>
                    {room.number}
                  </div>
                  <div style={{ fontSize: 14, color: '#666', marginBottom: 8 }}>
                    {room.type}
                  </div>
                  <div style={{ fontSize: 12, color: getStatusColor(room.status) }}>
                    {getStatusText(room.status)}
                  </div>
                  {room.status === 'occupied' && (
                    <div style={{ 
                      position: 'absolute', 
                      top: 8, 
                      right: 8, 
                      fontSize: 12, 
                      color: '#666',
                      backgroundColor: 'white',
                      padding: '2px 6px',
                      borderRadius: 4,
                      border: '1px solid #d9d9d9'
                    }}>
                      {bookings.find(b => b.roomNumber === room.number)?.guestName || 'Đang sử dụng'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        ))}

        {/* Modal thông tin phòng */}
        <Modal
          title={`Thông Tin Phòng ${selectedRoom?.number}`}
          open={!!selectedRoom}
          onCancel={() => setSelectedRoom(null)}
          footer={null}
          width={600}
        >
          {selectedRoom && (
            <div>
              <Row gutter={16}>
                <Col span={12}>
                  <Card size="small" title="Thông Tin Phòng">
                    <div><strong>Số phòng:</strong> {selectedRoom.number}</div>
                    <div><strong>Loại phòng:</strong> {selectedRoom.type}</div>
                    <div><strong>Tầng:</strong> {selectedRoom.floor}</div>
                    <div><strong>Giá:</strong> {selectedRoom.price.toLocaleString()}đ</div>
                    <div style={{ marginTop: 12 }}>
                      <Tag color={selectedRoom.status === 'available' ? 'green' : selectedRoom.status === 'occupied' ? 'red' : 'orange'}>
                        {getStatusText(selectedRoom.status)}
                      </Tag>
                    </div>
                  </Card>
                </Col>
                <Col span={12}>
                  <Card size="small" title="Thông Tin Khách">
                    {selectedRoom.status === 'occupied' ? (
                      <>
                        <div><strong>Họ tên:</strong> {bookings.find(b => b.roomNumber === selectedRoom.number)?.guestName}</div>
                        <div><strong>SĐT:</strong> {bookings.find(b => b.roomNumber === selectedRoom.number)?.guestPhone}</div>
                        <div><strong>CMND:</strong> {bookings.find(b => b.roomNumber === selectedRoom.number)?.guestIdCard}</div>
                        <div style={{ marginTop: 12 }}>
                          <Tag color="blue">Loại: {bookings.find(b => b.roomNumber === selectedRoom.number)?.bookingType}</Tag>
                        </div>
                      </>
                    ) : (
                      <div style={{ color: '#999', fontStyle: 'italic' }}>
                        Phòng trống - Chưa có khách
                      </div>
                    )}
                  </Card>
                </Col>
              </Row>
              
              <div style={{ marginTop: 16, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                {selectedRoom.status === 'available' && (
                  <Button type="primary" icon={<PlusOutlined />}>
                    Nhận Đặt Phòng
                  </Button>
                )}
                {selectedRoom.status === 'occupied' && (
                  <>
                    <Button type="primary" danger icon={<CheckCircleOutlined />}>
                      Trả Phòng
                    </Button>
                    <Button icon={<DollarOutlined />}>
                      Thanh Toán
                    </Button>
                  </>
                )}
                {selectedRoom.status === 'dirty' && (
                  <Button type="default" icon={<SyncOutlined />}>
                    Đánh Dấu Đã Dọn
                  </Button>
                )}
              </div>
            </div>
          )}
        </Modal>
      </div>
    );
  };

  // Render Check-in/Check-out
  const renderCheckInOut = () => {
    const todayBookings = bookings.filter(b => 
      moment(b.checkInTime).isSame(moment(), 'day') || 
      moment(b.checkOutTime).isSame(moment(), 'day')
    );

    const checkInColumns = [
      {
        title: 'Mã Đặt Phòng',
        dataIndex: 'id',
        key: 'id',
        render: (id) => `BK-${id.toString().padStart(3, '0')}`
      },
      {
        title: 'Thông Tin Khách',
        key: 'guest',
        render: (_, record) => (
          <div>
            <div><strong>{record.guestName}</strong></div>
            <div style={{ fontSize: '12px', color: '#666' }}>{record.guestPhone}</div>
            <div style={{ fontSize: '12px', color: '#666' }}>CMND: {record.guestIdCard}</div>
          </div>
        )
      },
      {
        title: 'Phòng',
        key: 'room',
        render: (_, record) => (
          <div>
            <div><strong>{record.roomNumber}</strong> ({record.roomType})</div>
            <div style={{ fontSize: '12px', color: '#666' }}>Giá: {record.totalAmount.toLocaleString()}đ</div>
          </div>
        )
      },
      {
        title: 'Thời Gian',
        key: 'time',
        render: (_, record) => (
          <div>
            <div><ClockCircleOutlined /> Nhận: {moment(record.checkInTime).format('DD/MM HH:mm')}</div>
            <div><HomeOutlined /> Trả: {moment(record.checkOutTime).format('DD/MM HH:mm')}</div>
          </div>
        )
      },
      {
        title: 'Trạng Thái',
        key: 'status',
        render: (_, record) => (
          <div>
            <Tag color={record.status === 'checked_in' ? 'green' : record.status === 'checked_out' ? 'blue' : 'orange'}>
              {record.status === 'checked_in' ? 'Đã nhận phòng' : record.status === 'checked_out' ? 'Đã trả phòng' : 'Chưa nhận phòng'}
            </Tag>
            <br />
            <Tag color={record.paymentStatus === 'paid' ? 'success' : 'warning'}>
              {record.paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
            </Tag>
          </div>
        )
      },
      {
        title: 'Thao Tác',
        key: 'action',
        render: (_, record) => (
          <Space>
            {record.status === 'checked_in' ? (
              <Button 
                type="primary" 
                danger 
                size="small" 
                onClick={() => handleCheckOut(record.id)}
                loading={loading}
              >
                <CheckCircleOutlined /> Trả Phòng
              </Button>
            ) : record.status === 'checked_out' ? (
              <Button 
                type="default" 
                size="small" 
                disabled
              >
                Đã Trả Phòng
              </Button>
            ) : (
              <Button 
                type="primary" 
                size="small" 
                onClick={() => handleCheckIn(record.id)}
                loading={loading}
              >
                <KeyOutlined /> Nhận Phòng
              </Button>
            )}
            
            {record.paymentStatus !== 'paid' && (
              <Button 
                type="default" 
                size="small" 
                onClick={() => handlePayment(record.id)}
                loading={loading}
              >
                <DollarOutlined /> Thanh Toán
              </Button>
            )}
          </Space>
        )
      },
    ];

    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <Title level={3}>🚪 Check-in/Check-out Hôm Nay</Title>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button type="primary" icon={<PlusOutlined />}>
              Thêm Check-in
            </Button>
            <Button icon={<CalendarOutlined />}>
              Lịch Công Việc
            </Button>
          </div>
        </div>

        {/* Thống kê hôm nay */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card bordered={false} style={{ background: '#e6f7ff' }}>
              <Statistic 
                title="Check-in Hôm Nay" 
                value={stats.todayCheckins} 
                prefix={<KeyOutlined style={{ color: '#1890ff' }} />} 
                valueStyle={{ color: '#1890ff' }} 
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card bordered={false} style={{ background: '#fff1f0' }}>
              <Statistic 
                title="Check-out Hôm Nay" 
                value={stats.todayCheckouts} 
                prefix={<HomeOutlined style={{ color: '#cf1322' }} />} 
                valueStyle={{ color: '#cf1322' }} 
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card bordered={false} style={{ background: '#f6ffed' }}>
              <Statistic 
                title="Doanh Thu Hôm Nay" 
                value={stats.revenueToday} 
                prefix={<DollarOutlined style={{ color: '#52c41a' }} />}
                formatter={(value) => `${value.toLocaleString()}đ`}
                valueStyle={{ color: '#52c41a' }} 
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card bordered={false} style={{ background: '#fff7e6' }}>
              <Statistic 
                title="Tổng Công Việc" 
                value={todayBookings.length} 
                prefix={<BellOutlined style={{ color: '#fa8c16' }} />} 
                valueStyle={{ color: '#fa8c16' }} 
              />
            </Card>
          </Col>
        </Row>

        {/* Tabs phân loại */}
        <Tabs defaultActiveKey="all" style={{ marginBottom: 24 }}>
          <TabPane tab="Tất Cả" key="all">
            <Table 
              columns={checkInColumns} 
              dataSource={todayBookings} 
              rowKey="id" 
              pagination={false}
            />
          </TabPane>
          <TabPane tab="Chưa Nhận Phòng" key="pending">
            <Table 
              columns={checkInColumns} 
              dataSource={todayBookings.filter(b => b.status === 'pending')} 
              rowKey="id" 
              pagination={false}
            />
          </TabPane>
          <TabPane tab="Đã Nhận Phòng" key="checked_in">
            <Table 
              columns={checkInColumns} 
              dataSource={todayBookings.filter(b => b.status === 'checked_in')} 
              rowKey="id" 
              pagination={false}
            />
          </TabPane>
          <TabPane tab="Đã Trả Phòng" key="checked_out">
            <Table 
              columns={checkInColumns} 
              dataSource={todayBookings.filter(b => b.status === 'checked_out')} 
              rowKey="id" 
              pagination={false}
            />
          </TabPane>
        </Tabs>

        {/* Cảnh báo */}
        <Alert
          message="Cảnh Báo"
          description="Có phòng chưa dọn dẹp cần xử lý ngay"
          type="warning"
          showIcon
          action={
            <Button size="small" type="primary">
              Xem Chi Tiết
            </Button>
          }
        />
      </div>
    );
  };

  // Render Booking (Đặt phòng)
  const renderBooking = () => {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <Title level={3}>📅 Đặt Phòng Mới</Title>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button type="primary" icon={<PlusOutlined />}>
              Tạo Đặt Phòng
            </Button>
            <Button icon={<CalendarOutlined />}>
              Lịch Đặt Phòng
            </Button>
          </div>
        </div>

        {/* Form đặt phòng */}
        <Card title="Thông Tin Đặt Phòng" style={{ marginBottom: 24 }}>
          <Form form={form} layout="vertical">
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item label="Họ tên khách" name="guestName" rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}>
                  <Input placeholder="Nhập họ tên khách hàng" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Số điện thoại" name="guestPhone" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}>
                  <Input placeholder="Nhập số điện thoại" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="CMND/CCCD" name="guestIdCard" rules={[{ required: true, message: 'Vui lòng nhập CMND/CCCD' }]}>
                  <Input placeholder="Nhập CMND/CCCD" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item label="Số phòng" name="roomNumber" rules={[{ required: true, message: 'Vui lòng chọn số phòng' }]}>
                  <Select placeholder="Chọn số phòng">
                    {rooms.filter(r => r.status === 'available').map(room => (
                      <Option key={room.id} value={room.number}>
                        {room.number} - {room.type} ({room.price.toLocaleString()}đ)
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Thời gian nhận phòng" name="checkInTime" rules={[{ required: true, message: 'Vui lòng chọn thời gian nhận phòng' }]}>
                  <DatePicker showTime style={{ width: '100%' }} placeholder="Chọn thời gian nhận phòng" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Thời gian trả phòng" name="checkOutTime" rules={[{ required: true, message: 'Vui lòng chọn thời gian trả phòng' }]}>
                  <DatePicker showTime style={{ width: '100%' }} placeholder="Chọn thời gian trả phòng" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item label="Loại đặt phòng" name="bookingType" initialValue="walk_in">
                  <Select>
                    <Option value="walk_in">Đặt tại quầy</Option>
                    <Option value="online">Đặt online</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Phương thức thanh toán" name="paymentMethod" initialValue="cash">
                  <Select>
                    <Option value="cash">Tiền mặt</Option>
                    <Option value="card">Thẻ</Option>
                    <Option value="transfer">Chuyển khoản</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Ghi chú" name="note">
                  <Input.TextArea placeholder="Ghi chú đặc biệt (nếu có)" />
                </Form.Item>
              </Col>
            </Row>
          </Form>
          
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <Button onClick={() => form.resetFields()}>
              Làm Mới
            </Button>
            <Button type="primary" onClick={handleNewBooking} icon={<PlusOutlined />}>
              Đặt Phòng
            </Button>
          </div>
        </Card>

        {/* Danh sách đặt phòng hôm nay */}
        <Card title="Danh Sách Đặt Phòng Hôm Nay">
          <Table 
            columns={[
              {
                title: 'Mã Đặt Phòng',
                dataIndex: 'id',
                key: 'id',
                render: (id) => `BK-${id.toString().padStart(3, '0')}`
              },
              {
                title: 'Khách Hàng',
                key: 'guest',
                render: (_, record) => (
                  <div>
                    <div><strong>{record.guestName}</strong></div>
                    <div style={{ fontSize: '12px', color: '#666' }}>{record.guestPhone}</div>
                  </div>
                )
              },
              {
                title: 'Phòng',
                key: 'room',
                render: (_, record) => (
                  <div>
                    <div><strong>{record.roomNumber}</strong> ({record.roomType})</div>
                    <div style={{ fontSize: '12px', color: '#666' }}>{record.totalAmount.toLocaleString()}đ</div>
                  </div>
                )
              },
              {
                title: 'Thời Gian',
                key: 'time',
                render: (_, record) => (
                  <div>
                    <div><ClockCircleOutlined /> {moment(record.checkInTime).format('DD/MM HH:mm')}</div>
                    <div><HomeOutlined /> {moment(record.checkOutTime).format('DD/MM HH:mm')}</div>
                  </div>
                )
              },
              {
                title: 'Trạng Thái',
                key: 'status',
                render: (_, record) => (
                  <Tag color={record.status === 'checked_in' ? 'green' : record.status === 'checked_out' ? 'blue' : 'orange'}>
                    {record.status === 'checked_in' ? 'Đã nhận phòng' : record.status === 'checked_out' ? 'Đã trả phòng' : 'Chưa nhận phòng'}
                  </Tag>
                )
              },
              {
                title: 'Thao Tác',
                key: 'action',
                render: (_, record) => (
                  <Space>
                    <Button size="small" icon={<EditOutlined />}>
                      Sửa
                    </Button>
                    <Button size="small" icon={<DeleteOutlined />} danger>
                      Hủy
                    </Button>
                  </Space>
                )
              }
            ]} 
            dataSource={bookings.filter(b => moment(b.checkInTime).isSame(moment(), 'day'))} 
            rowKey="id" 
            pagination={false}
          />
        </Card>
      </div>
    );
  };

  // Render Services (Dịch vụ phát sinh)
  const renderServices = () => {
    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <Title level={3}>🛍️ Dịch Vụ Phát Sinh</Title>
          <div style={{ display: 'flex', gap: 8 }}>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setServiceModalVisible(true)}>
              Thêm Dịch Vụ
            </Button>
            <Button icon={<CalendarOutlined />}>
              Lịch Sử Dịch Vụ
            </Button>
          </div>
        </div>

        {/* Thống kê dịch vụ */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card bordered={false} style={{ background: '#e6f7ff' }}>
              <Statistic 
                title="Tổng Dịch Vụ" 
                value={services.length} 
                prefix={<AppstoreOutlined style={{ color: '#1890ff' }} />} 
                valueStyle={{ color: '#1890ff' }} 
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card bordered={false} style={{ background: '#f6ffed' }}>
              <Statistic 
                title="Dịch Vụ Hôm Nay" 
                value={0} 
                prefix={<BellOutlined style={{ color: '#52c41a' }} />} 
                valueStyle={{ color: '#52c41a' }} 
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card bordered={false} style={{ background: '#fff7e6' }}>
              <Statistic 
                title="Doanh Thu Dịch Vụ" 
                value={0} 
                prefix={<DollarOutlined style={{ color: '#fa8c16' }} />}
                formatter={(value) => `${value.toLocaleString()}đ`}
                valueStyle={{ color: '#fa8c16' }} 
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card bordered={false} style={{ background: '#fff1f0' }}>
              <Statistic 
                title="Phòng Có Dịch Vụ" 
                value={0} 
                prefix={<HomeOutlined style={{ color: '#cf1322' }} />} 
                valueStyle={{ color: '#cf1322' }} 
              />
            </Card>
          </Col>
        </Row>

        {/* Danh sách dịch vụ */}
        <Card title="Danh Sách Dịch Vụ">
          <Table 
            columns={[
              {
                title: 'STT',
                dataIndex: 'id',
                key: 'id',
                render: (id) => id
              },
              {
                title: 'Tên Dịch Vụ',
                dataIndex: 'name',
                key: 'name'
              },
              {
                title: 'Loại Dịch Vụ',
                dataIndex: 'category',
                key: 'category',
                render: (category) => <Tag>{category}</Tag>
              },
              {
                title: 'Đơn Giá',
                dataIndex: 'price',
                key: 'price',
                render: (price) => `${price.toLocaleString()}đ`
              },
              {
                title: 'Đơn Vị',
                dataIndex: 'unit',
                key: 'unit'
              },
              {
                title: 'Thao Tác',
                key: 'action',
                render: () => (
                  <Space>
                    <Button size="small" icon={<EditOutlined />}>
                      Sửa
                    </Button>
                    <Button size="small" icon={<DeleteOutlined />} danger>
                      Xóa
                    </Button>
                  </Space>
                )
              }
            ]} 
            dataSource={services} 
            rowKey="id" 
            pagination={false}
          />
        </Card>

        {/* Modal thêm dịch vụ */}
        <Modal
          title="Thêm Dịch Vụ Phát Sinh"
          open={serviceModalVisible}
          onOk={handleAddService}
          onCancel={() => setServiceModalVisible(false)}
          width={600}
        >
          <Form form={serviceForm} layout="vertical">
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Phòng" name="roomNumber" rules={[{ required: true }]}>
                  <Select placeholder="Chọn phòng">
                    {rooms.map(room => (
                      <Option key={room.id} value={room.number}>{room.number} ({room.type})</Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Dịch vụ" name="serviceId" rules={[{ required: true }]}>
                  <Select placeholder="Chọn dịch vụ">
                    {services.map(service => (
                      <Option key={service.id} value={service.id}>
                        {service.name} - {service.price.toLocaleString()}đ
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={12}>
                <Form.Item label="Số lượng" name="quantity" rules={[{ required: true }]}>
                  <Input type="number" min="1" />
                </Form.Item>
              </Col>
              <Col span={12}>
                <Form.Item label="Ghi chú" name="note">
                  <Input.TextArea placeholder="Ghi chú (nếu có)" />
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Modal>
      </div>
    );
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider 
        collapsible 
        collapsed={collapsed} 
        onCollapse={setCollapsed}
        style={{ background: '#fff', boxShadow: '2px 0 8px rgba(0,0,0,0.15)' }}
      >
        <div style={{ padding: 16, textAlign: collapsed ? 'center' : 'left' }}>
          <Title level={collapsed ? 5 : 4} style={{ margin: 0, color: '#1890ff' }}>
            {collapsed ? 'LỄ TÂN' : 'BÀN LỄ TÂN'}
          </Title>
        </div>
        <Menu
          theme="light"
          selectedKeys={[activeTab]}
          mode="inline"
          items={[
            {
              key: 'room-map',
              icon: <HomeOutlined />,
              label: 'Sơ đồ phòng',
            },
            {
              key: 'check-in-out',
              icon: <KeyOutlined />,
              label: 'Check-in/Check-out',
            },
            {
              key: 'booking',
              icon: <FileTextOutlined />,
              label: 'Đặt phòng',
            },
            {
              key: 'services',
              icon: <AppstoreOutlined />,
              label: 'Dịch vụ phát sinh',
            }
          ]}
          onClick={({ key }) => setActiveTab(key)}
        />
      </Sider>
      
      <Layout>
        <Content style={{ margin: '24px 16px 0', padding: 24, background: '#fff', minHeight: 280 }}>
          <Spin spinning={loading}>
            {activeTab === 'room-map' && renderRoomMap()}
            {activeTab === 'check-in-out' && renderCheckInOut()}
            {activeTab === 'booking' && renderBooking()}
            {activeTab === 'services' && renderServices()}
          </Spin>
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminDashboard;