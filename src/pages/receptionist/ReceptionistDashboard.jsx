import React, { useState, useEffect } from 'react';
import { Layout, Menu, Card, Row, Col, Statistic, Table, Tag, Button, Typography, Space, DatePicker, Select, Input, Modal, Form, message, Badge, Tooltip, Tabs, List, Avatar, Drawer, Spin, Alert } from 'antd';
import { KeyOutlined, CheckCircleOutlined, SyncOutlined, UserOutlined, CalendarOutlined, SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, DollarOutlined, ClockCircleOutlined, HomeOutlined, FileTextOutlined, UserAddOutlined, SettingOutlined, BellOutlined, AppstoreOutlined, CheckOutlined, CloseCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import moment from 'moment';
import { roomApi, bookingApi, serviceApi, roomInventoryApi } from '../../services/api';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;
const { TabPane } = Tabs;
const { Header, Sider, Content } = Layout;

const ReceptionistDashboard = () => {
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

  // Lấy dữ liệu từ API backend
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Lấy danh sách phòng
        const roomsResponse = await roomApi.getRooms();
        const roomsData = roomsResponse.data || [];
        
        // Lấy danh sách loại phòng để ánh xạ thông tin
        const roomTypesResponse = await roomApi.getRoomTypes();
        const roomTypesData = roomTypesResponse.data || [];

        // Xử lý dữ liệu phòng
        const processedRooms = roomsData.map(room => {
          const roomType = roomTypesData.find(rt => rt.id === room.roomTypeId);
          const roomTypeConfig = {
            'Standard': { icon: '🛏️', color: '#1890ff' },
            'Deluxe': { icon: '🏨', color: '#52c41a' },
            'Suite': { icon: '👑', color: '#faad14' },
            'Family': { icon: '👨‍👩‍👧‍👦', color: '#722ed1' },
            'Executive': { icon: '💼', color: '#eb2f96' }
          };
          
          const typeInfo = roomTypeConfig[roomType?.name || 'Standard'] || roomTypeConfig['Standard'];

          return {
            id: room.id,
            number: room.roomNumber,
            type: roomType?.name || 'Standard',
            status: room.status || 'available',
            price: roomType?.basePrice || 500000,
            floor: Math.floor(room.roomNumber / 100),
            icon: typeInfo.icon,
            color: typeInfo.color
          };
        });

        setRooms(processedRooms);

        // Lấy danh sách booking
        const bookingsResponse = await bookingApi.getBookings();
        const bookingsData = bookingsResponse.data || [];

        // Lấy danh sách dịch vụ
        const servicesResponse = await serviceApi.getServices();
        const servicesData = servicesResponse.data || [];

        setBookings(bookingsData);
        setServices(servicesData);

        // Tính toán thống kê
        const available = processedRooms.filter(r => r.status === 'available').length;
        const occupied = processedRooms.filter(r => r.status === 'occupied').length;
        const dirty = processedRooms.filter(r => r.status === 'dirty').length;
        const todayCheckins = bookingsData.filter(b => moment(b.checkInDate).isSame(moment(), 'day')).length;
        const todayCheckouts = bookingsData.filter(b => moment(b.checkOutDate).isSame(moment(), 'day')).length;
        const revenueToday = bookingsData
          .filter(b => moment(b.checkOutDate).isSame(moment(), 'day'))
          .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

        setStats({
          availableRooms: available,
          occupiedRooms: occupied,
          dirtyRooms: dirty,
          todayCheckins,
          todayCheckouts,
          revenueToday
        });

      } catch (error) {
        console.error('Lỗi khi lấy dữ liệu từ API:', error);
        message.error('Backend trả về lỗi 500. Đang sử dụng dữ liệu mẫu.');
        console.log('Lưu ý: Backend đang chạy trên cổng 5070');
        console.log('Lỗi 500 có thể do backend chưa cấu hình đúng hoặc database chưa kết nối');
        console.log('Backend hiện không hoạt động, ứng dụng sẽ sử dụng dữ liệu mẫu để demo');
        // Sử dụng dữ liệu mẫu nếu API không hoạt động
        loadMockData();
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Dữ liệu mẫu (dùng khi API không hoạt động)
  const loadMockData = () => {
    const mockRooms = [];
    const roomTypes = [
      { type: 'Standard', price: 500000, icon: '🛏️', color: '#1890ff' },
      { type: 'Deluxe', price: 800000, icon: '🏨', color: '#52c41a' },
      { type: 'Suite', price: 1200000, icon: '👑', color: '#faad14' },
      { type: 'Family', price: 1500000, icon: '👨‍👩‍👧‍👦', color: '#722ed1' },
      { type: 'Executive', price: 2000000, icon: '💼', color: '#eb2f96' }
    ];

    let roomId = 1;
    for (let floor = 1; floor <= 10; floor++) {
      for (let roomNum = 1; roomNum <= 20; roomNum++) {
        const roomType = roomTypes[Math.floor(Math.random() * roomTypes.length)];
        const status = Math.random() < 0.3 ? 'dirty' : Math.random() < 0.4 ? 'occupied' : 'available';
        
        mockRooms.push({
          id: roomId++,
          number: `${floor.toString().padStart(2, '0')}${roomNum.toString().padStart(2, '0')}`,
          type: roomType.type,
          status: status,
          price: roomType.price,
          floor: floor,
          icon: roomType.icon,
          color: roomType.color
        });
      }
    }

    const mockBookings = [
      { 
        id: 1, 
        guestName: 'Nguyễn Văn A', 
        guestPhone: '0912345678',
        guestIdCard: '012345678901',
        roomNumber: '0102', 
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
        roomNumber: '0202', 
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
        roomNumber: '0303', 
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
        roomNumber: '0403', 
        roomType: 'Family',
        checkInTime: moment().subtract(1, 'day'),
        checkOutTime: moment().add(1, 'day'),
        status: 'checked_in',
        paymentStatus: 'paid',
        totalAmount: 3000000,
        bookingType: 'online'
      },
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
  };

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
    const floors = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    
    const getStatusColor = (status) => {
      switch (status) {
        case 'available': return '#52c41a';
        case 'occupied': return '#ff4d4f';
        case 'dirty': return '#faad14';
        case 'maintenance': return '#722ed1';
        default: return '#d9d9d9';
      }
    };

    const getStatusText = (status) => {
      switch (status) {
        case 'available': return 'Trống';
        case 'occupied': return 'Có khách';
        case 'dirty': return 'Đang dọn';
        case 'maintenance': return 'Bảo trì';
        default: return 'Không xác định';
      }
    };

    return (
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <Title level={3}>🗺️ Sơ Đồ Phòng</Title>
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
            title={`Tầng ${floor.toString().padStart(2, '0')}`} 
            style={{ marginBottom: 24, background: '#fdf8ef' }}
            extra={
              <Space>
                <Tag color="green" style={{ background: '#f6ffed', borderColor: '#b7eb8f' }}>Trống</Tag>
                <Tag color="red" style={{ background: '#fff1f0', borderColor: '#ffccc7' }}>Có khách</Tag>
                <Tag color="orange" style={{ background: '#fffbe6', borderColor: '#ffe7ba' }}>Đang dọn</Tag>
                <Tag color="purple" style={{ background: '#f9f0ff', borderColor: '#d3adf7' }}>Bảo trì</Tag>
              </Space>
            }
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
              {rooms.filter(room => room.floor === floor).map(room => (
                <div 
                  key={room.id}
                  style={{
                    border: '2px solid',
                    borderColor: getStatusColor(room.status),
                    borderRadius: 8,
                    padding: 12,
                    textAlign: 'center',
                    cursor: 'pointer',
                    backgroundColor: room.status === 'available' ? '#f6ffed' : room.status === 'occupied' ? '#fff1f0' : room.status === 'maintenance' ? '#f9f0ff' : '#fffbe6',
                    transition: 'all 0.3s',
                    position: 'relative',
                    minHeight: 80,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center'
                  }}
                  onClick={() => setSelectedRoom(room)}
                >
                  <div style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 4, color: '#1a1a1a' }}>
                    {room.number}
                  </div>
                  <div style={{ fontSize: 12, color: room.color, marginBottom: 4 }}>
                    {room.icon} {room.type}
                  </div>
                  <div style={{ fontSize: 10, color: getStatusColor(room.status), fontWeight: 'bold' }}>
                    {getStatusText(room.status)}
                  </div>
                  {room.status === 'occupied' && (
                    <div style={{ 
                      position: 'absolute', 
                      top: 4, 
                      right: 4, 
                      fontSize: 10, 
                      color: '#666',
                      backgroundColor: 'white',
                      padding: '1px 4px',
                      borderRadius: 3,
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
        </div>

        {/* Thống kê hôm nay */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card bordered={false} style={{ background: '#e6f7ff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <Statistic 
                title="Check-in Hôm Nay" 
                value={stats.todayCheckins} 
                prefix={<KeyOutlined style={{ color: '#1890ff' }} />} 
                valueStyle={{ color: '#1890ff' }} 
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card bordered={false} style={{ background: '#fff1f0', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <Statistic 
                title="Check-out Hôm Nay" 
                value={stats.todayCheckouts} 
                prefix={<HomeOutlined style={{ color: '#cf1322' }} />} 
                valueStyle={{ color: '#cf1322' }} 
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card bordered={false} style={{ background: '#f6ffed', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
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
            <Card bordered={false} style={{ background: '#fff7e6', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
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
          style={{ background: '#fff7e6', border: '1px solid #ffe7ba' }}
          action={
            <Button size="small" type="primary" style={{ background: '#c19b4a', borderColor: '#c19b4a' }}>
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
        </div>

        {/* Form đặt phòng */}
        <Card title="Thông Tin Đặt Phòng" style={{ marginBottom: 24, background: '#fdf8ef' }}>
          <Form form={form} layout="vertical">
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item label="Họ tên khách" name="guestName" rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}>
                  <Input placeholder="Nhập họ tên khách hàng" style={{ borderColor: '#d9d9d9' }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Số điện thoại" name="guestPhone" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}>
                  <Input placeholder="Nhập số điện thoại" style={{ borderColor: '#d9d9d9' }} />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="CMND/CCCD" name="guestIdCard" rules={[{ required: true, message: 'Vui lòng nhập CMND/CCCD' }]}>
                  <Input placeholder="Nhập CMND/CCCD" style={{ borderColor: '#d9d9d9' }} />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item label="Số phòng" name="roomNumber" rules={[{ required: true, message: 'Vui lòng chọn số phòng' }]}>
                  <Select placeholder="Chọn số phòng" style={{ borderColor: '#d9d9d9' }}>
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
                  <DatePicker showTime style={{ width: '100%', borderColor: '#d9d9d9' }} placeholder="Chọn thời gian nhận phòng" />
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Thời gian trả phòng" name="checkOutTime" rules={[{ required: true, message: 'Vui lòng chọn thời gian trả phòng' }]}>
                  <DatePicker showTime style={{ width: '100%', borderColor: '#d9d9d9' }} placeholder="Chọn thời gian trả phòng" />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col span={8}>
                <Form.Item label="Loại đặt phòng" name="bookingType" initialValue="walk_in">
                  <Select style={{ borderColor: '#d9d9d9' }}>
                    <Option value="walk_in">Đặt tại quầy</Option>
                    <Option value="online">Đặt online</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Phương thức thanh toán" name="paymentMethod" initialValue="cash">
                  <Select style={{ borderColor: '#d9d9d9' }}>
                    <Option value="cash">Tiền mặt</Option>
                    <Option value="card">Thẻ</Option>
                    <Option value="transfer">Chuyển khoản</Option>
                  </Select>
                </Form.Item>
              </Col>
              <Col span={8}>
                <Form.Item label="Ghi chú" name="note">
                  <Input.TextArea placeholder="Ghi chú đặc biệt (nếu có)" style={{ borderColor: '#d9d9d9' }} />
                </Form.Item>
              </Col>
            </Row>
          </Form>
          
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <Button onClick={() => form.resetFields()} style={{ borderColor: '#d9d9d9' }}>
              Làm Mới
            </Button>
          </div>
        </Card>

        {/* Danh sách đặt phòng hôm nay */}
        <Card title="Danh Sách Đặt Phòng Hôm Nay" style={{ background: '#fdf8ef' }}>
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
        </div>

        {/* Thống kê dịch vụ */}
        <Row gutter={16} style={{ marginBottom: 24 }}>
          <Col span={6}>
            <Card bordered={false} style={{ background: '#e6f7ff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <Statistic 
                title="Tổng Dịch Vụ" 
                value={services.length} 
                prefix={<AppstoreOutlined style={{ color: '#1890ff' }} />} 
                valueStyle={{ color: '#1890ff' }} 
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card bordered={false} style={{ background: '#f6ffed', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <Statistic 
                title="Dịch Vụ Hôm Nay" 
                value={0} 
                prefix={<BellOutlined style={{ color: '#52c41a' }} />} 
                valueStyle={{ color: '#52c41a' }} 
              />
            </Card>
          </Col>
          <Col span={6}>
            <Card bordered={false} style={{ background: '#fff7e6', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
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
            <Card bordered={false} style={{ background: '#fff1f0', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
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
        <Card title="Danh Sách Dịch Vụ" style={{ background: '#fdf8ef' }}>
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
      </div>
    );
  };

  return (
    <div style={{ background: '#ffffff', minHeight: '100vh' }}>
      {/* Dashboard Header */}
      <div style={{ 
        background: '#ffffff', 
        padding: '16px 24px', 
        borderBottom: '1px solid #f0f0f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Title level={3} style={{ margin: 0, color: '#c19b4a', fontWeight: 'bold' }}>
          BÀN LỄ TÂN
        </Title>
        <div style={{ display: 'flex', gap: 12 }}>
          <Button 
            type={activeTab === 'room-map' ? 'primary' : 'default'}
            icon={<HomeOutlined style={{ color: activeTab === 'room-map' ? '#ffffff' : '#c19b4a' }} />}
            onClick={() => setActiveTab('room-map')}
            style={{ 
              background: activeTab === 'room-map' ? '#c19b4a' : 'transparent',
              borderColor: '#c19b4a',
              color: activeTab === 'room-map' ? '#ffffff' : '#1a1a1a'
            }}
          >
            Sơ đồ phòng
          </Button>
          <Button 
            type={activeTab === 'check-in-out' ? 'primary' : 'default'}
            icon={<KeyOutlined style={{ color: activeTab === 'check-in-out' ? '#ffffff' : '#c19b4a' }} />}
            onClick={() => setActiveTab('check-in-out')}
            style={{ 
              background: activeTab === 'check-in-out' ? '#c19b4a' : 'transparent',
              borderColor: '#c19b4a',
              color: activeTab === 'check-in-out' ? '#ffffff' : '#1a1a1a'
            }}
          >
            Check-in/Check-out
          </Button>
          <Button 
            type={activeTab === 'booking' ? 'primary' : 'default'}
            icon={<FileTextOutlined style={{ color: activeTab === 'booking' ? '#ffffff' : '#c19b4a' }} />}
            onClick={() => setActiveTab('booking')}
            style={{ 
              background: activeTab === 'booking' ? '#c19b4a' : 'transparent',
              borderColor: '#c19b4a',
              color: activeTab === 'booking' ? '#ffffff' : '#1a1a1a'
            }}
          >
            Đặt phòng
          </Button>
          <Button 
            type={activeTab === 'services' ? 'primary' : 'default'}
            icon={<AppstoreOutlined style={{ color: activeTab === 'services' ? '#ffffff' : '#c19b4a' }} />}
            onClick={() => setActiveTab('services')}
            style={{ 
              background: activeTab === 'services' ? '#c19b4a' : 'transparent',
              borderColor: '#c19b4a',
              color: activeTab === 'services' ? '#ffffff' : '#1a1a1a'
            }}
          >
            Dịch vụ phát sinh
          </Button>
        </div>
      </div>

      {/* Content Area */}
      <div style={{ padding: 0, background: '#ffffff' }}>
        <Spin spinning={loading}>
          {activeTab === 'room-map' && renderRoomMap()}
          {activeTab === 'check-in-out' && renderCheckInOut()}
          {activeTab === 'booking' && renderBooking()}
          {activeTab === 'services' && renderServices()}
        </Spin>
      </div>
    </div>
  );
};

export default ReceptionistDashboard;