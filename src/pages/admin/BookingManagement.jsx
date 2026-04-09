import React, { useState } from 'react';
import { 
  Row, Col, Card, Button, Typography, message, Empty, Tag, Space, Spin, 
  DatePicker, InputNumber, Divider, Modal, Form, Input 
} from 'antd';
import { 
  SearchOutlined, CalendarOutlined, TeamOutlined, CheckCircleOutlined,
  UserOutlined, PhoneOutlined, MailOutlined, HomeOutlined
} from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;

const BookingManagement = () => {
  const [loading, setLoading] = useState(false);
  const [availableRoomTypes, setAvailableRoomTypes] = useState([]);
  
  // State tìm kiếm
  const [dates, setDates] = useState(null);
  const [adults, setAdults] = useState(1);
  const [children, setChildren] = useState(0);

  // State giỏ hàng (Phòng đã chọn)
  const [selectedRooms, setSelectedRooms] = useState([]); 
  
  // State Modal đặt phòng
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form] = Form.useForm();

  // =======================================================
  // 1. TÌM PHÒNG TRỐNG
  // =======================================================
  const handleSearch = async () => {
    if (!dates || dates.length !== 2) {
      message.warning("Vui lòng chọn ngày nhận và trả phòng!");
      return;
    }

    setLoading(true);
    setSelectedRooms([]); // Reset giỏ hàng mỗi lần tìm mới
    
    try {
      const token = localStorage.getItem('token');
      const payload = {
        checkIn: dates[0].format('YYYY-MM-DDTHH:mm:ss'),
        checkOut: dates[1].format('YYYY-MM-DDTHH:mm:ss'),
        adults: adults,
        children: children
      };

      // 🚨 GỌI API BACKEND ĐÃ FIX: Bookings (có 's')
      const res = await axios.post('https://localhost:5070/api/Bookings/available-rooms', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setAvailableRoomTypes(res.data);
      if (res.data.length === 0) {
        message.info("Rất tiếc, không còn phòng trống cho khoảng thời gian này.");
      }
    } catch (error) {
      message.error(error.response?.data?.message || "Lỗi khi tìm phòng trống!");
    } finally {
      setLoading(false);
    }
  };

  // =======================================================
  // 2. CHỌN / BỎ CHỌN PHÒNG VÀO GIỎ HÀNG
  // =======================================================
  const toggleRoomSelection = (room, roomType) => {
    const isAlreadySelected = selectedRooms.some(r => r.id === room.id);
    
    if (isAlreadySelected) {
      // Bỏ chọn
      setSelectedRooms(selectedRooms.filter(r => r.id !== room.id));
    } else {
      // Chọn thêm
      setSelectedRooms([...selectedRooms, { 
        ...room, 
        roomTypeName: roomType.roomTypeName, 
        pricePerNight: roomType.pricePerNight 
      }]);
    }
  };

  // =======================================================
  // 3. TÍNH TỔNG TIỀN
  // =======================================================
  const calculateTotal = () => {
    if (!dates || dates.length !== 2 || selectedRooms.length === 0) return { nights: 0, total: 0 };
    
    const nights = dates[1].diff(dates[0], 'day');
    const totalNightPrice = selectedRooms.reduce((sum, room) => sum + room.pricePerNight, 0);
    
    return { nights, total: totalNightPrice * nights };
  };

  const { nights, total } = calculateTotal();

  // =======================================================
  // 4. CHỐT ĐƠN (GỬI LÊN BACKEND)
  // =======================================================
  const handleConfirmBooking = async (values) => {
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        guestName: values.guestName,
        guestPhone: values.guestPhone,
        guestEmail: values.guestEmail,
        checkIn: dates[0].format('YYYY-MM-DDTHH:mm:ss'),
        checkOut: dates[1].format('YYYY-MM-DDTHH:mm:ss'),
        selectedRoomIds: selectedRooms.map(r => r.id)
      };

      // 🚨 GỌI API BACKEND ĐÃ FIX: Bookings (có 's')
      const res = await axios.post('https://localhost:5070/api/Bookings/create', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      message.success(`Đặt phòng thành công! Mã đơn: ${res.data.bookingCode}`);
      setIsModalVisible(false);
      form.resetFields();
      
      // Load lại danh sách phòng trống để ẩn mấy phòng vừa đặt đi
      handleSearch(); 
    } catch (error) {
      message.error(error.response?.data?.message || "Lỗi khi tạo đơn đặt phòng!");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: '24px 32px', backgroundColor: '#f5f7fa', minHeight: '100vh' }}>
      
      {/* 1. KHU VỰC TÌM KIẾM */}
      <Card style={{ borderRadius: 12, boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: 24 }} bodyStyle={{ padding: '24px' }}>
        <Title level={3} style={{ marginTop: 0, color: '#1f1f1f' }}>Đăng Ký Đặt Phòng</Title>
        <Text type="secondary" style={{ display: 'block', marginBottom: 20 }}>Tìm kiếm phòng trống và tạo lịch đặt phòng mới cho khách hàng</Text>
        
        <Row gutter={16} align="bottom">
          <Col span={8}>
            <Text strong style={{ display: 'block', marginBottom: 8 }}><CalendarOutlined /> Nhận / Trả phòng</Text>
            <RangePicker 
              size="large" 
              style={{ width: '100%' }} 
              format="DD/MM/YYYY"
              onChange={setDates}
              disabledDate={(current) => current && current < dayjs().startOf('day')} // Chặn ngày quá khứ
            />
          </Col>
          <Col span={4}>
            <Text strong style={{ display: 'block', marginBottom: 8 }}><TeamOutlined /> Người lớn</Text>
            <InputNumber size="large" min={1} value={adults} onChange={setAdults} style={{ width: '100%' }} />
          </Col>
          <Col span={4}>
            <Text strong style={{ display: 'block', marginBottom: 8 }}><TeamOutlined /> Trẻ em</Text>
            <InputNumber size="large" min={0} value={children} onChange={setChildren} style={{ width: '100%' }} />
          </Col>
          <Col span={4}>
            <Button type="primary" size="large" block icon={<SearchOutlined />} onClick={handleSearch} loading={loading}>
              Tìm Phòng
            </Button>
          </Col>
        </Row>
      </Card>

      {/* 2. HIỂN THỊ DANH SÁCH PHÒNG TRỐNG */}
      <Spin spinning={loading} description="Đang quét sơ đồ phòng...">
        {availableRoomTypes.length === 0 && !loading ? (
          <Empty description="Vui lòng chọn ngày và bấm Tìm kiếm" style={{ marginTop: 60 }} />
        ) : (
          availableRoomTypes.map(type => (
            <Card key={type.roomTypeId} style={{ borderRadius: 12, marginBottom: 16, borderLeft: '6px solid #1890ff' }}>
              <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
                <div>
                  <Title level={4} style={{ margin: 0, color: '#1890ff' }}>{type.roomTypeName}</Title>
                  <Text type="secondary">Tối đa: {type.capacityAdults} người lớn, {type.capacityChildren} trẻ em</Text>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#ff4d4f' }}>
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(type.pricePerNight)}
                  </Text>
                  <Text type="secondary" style={{ display: 'block' }}>/ đêm</Text>
                </div>
              </Row>
              
              <Divider style={{ margin: '12px 0' }} />
              
              {/* CÁC NÚT BẤM CHỌN PHÒNG */}
              <Space size={[12, 12]} wrap>
                {type.availableRooms.map(room => {
                  const isSelected = selectedRooms.some(r => r.id === room.id);
                  return (
                    <Button 
                      key={room.id}
                      type={isSelected ? "primary" : "default"}
                      size="large"
                      style={{ 
                        borderRadius: 8, width: 100, 
                        backgroundColor: isSelected ? '#52c41a' : '',
                        borderColor: isSelected ? '#52c41a' : ''
                      }}
                      onClick={() => toggleRoomSelection(room, type)}
                    >
                      P. {room.roomNumber}
                    </Button>
                  );
                })}
              </Space>
            </Card>
          ))
        )}
      </Spin>

      {/* 3. GIỎ HÀNG NỔI LÊN KHI CHỌN PHÒNG */}
      {selectedRooms.length > 0 && (
        <Card 
          style={{ 
            position: 'sticky', bottom: 20, zIndex: 1000, 
            borderRadius: 12, boxShadow: '0 -4px 20px rgba(0,0,0,0.1)', borderTop: '4px solid #52c41a'
          }}
          bodyStyle={{ padding: '16px 24px' }}
        >
          <Row justify="space-between" align="middle">
            <Col>
              <Title level={5} style={{ margin: 0 }}>
                Đã chọn <span style={{ color: '#1890ff' }}>{selectedRooms.length}</span> phòng cho <span style={{ color: '#1890ff' }}>{nights}</span> đêm
              </Title>
              <Space style={{ marginTop: 8 }} wrap>
                {selectedRooms.map(r => (
                  <Tag color="blue" key={r.id}>P. {r.roomNumber} ({r.roomTypeName})</Tag>
                ))}
              </Space>
            </Col>
            <Col style={{ textAlign: 'right' }}>
              <Text type="secondary" style={{ fontSize: 16 }}>Tổng tiền tạm tính:</Text>
              <Title level={2} style={{ margin: 0, color: '#ff4d4f' }}>
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)}
              </Title>
              <Button 
                type="primary" size="large" icon={<CheckCircleOutlined />} 
                style={{ marginTop: 12, borderRadius: 8, width: 200, height: 45, fontSize: 16 }}
                onClick={() => setIsModalVisible(true)}
              >
                Tiến Hành Đặt Phòng
              </Button>
            </Col>
          </Row>
        </Card>
      )}

      {/* 4. MODAL NHẬP THÔNG TIN KHÁCH */}
      <Modal
        title={<Title level={4} style={{ margin: 0 }}><HomeOutlined /> Xác nhận thông tin Đặt phòng</Title>}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        centered
        width={600}
        destroyOnClose
      >
        <div style={{ backgroundColor: '#f9f9f9', padding: 16, borderRadius: 8, marginBottom: 24, marginTop: 16 }}>
          <Row justify="space-between">
            <Col><Text strong>Nhận phòng:</Text> <Text>{dates?.[0]?.format('DD/MM/YYYY')}</Text></Col>
            <Col><Text strong>Trả phòng:</Text> <Text>{dates?.[1]?.format('DD/MM/YYYY')}</Text></Col>
          </Row>
          <Divider style={{ margin: '12px 0' }}/>
          <Row justify="space-between">
            <Col><Text strong>Tổng tiền ({nights} đêm):</Text></Col>
            <Col><Text strong style={{ color: '#ff4d4f', fontSize: 18 }}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(total)}</Text></Col>
          </Row>
        </div>

        <Form form={form} layout="vertical" onFinish={handleConfirmBooking}>
          <Form.Item name="guestName" label="Họ tên người đại diện" rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}>
            <Input prefix={<UserOutlined />} size="large" placeholder="Nguyễn Văn A" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="guestPhone" label="Số điện thoại" rules={[{ required: true, message: 'Vui lòng nhập số ĐT!' }]}>
                <Input prefix={<PhoneOutlined />} size="large" placeholder="0909..." />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="guestEmail" label="Email (Không bắt buộc)">
                <Input prefix={<MailOutlined />} size="large" placeholder="email@domain.com" />
              </Form.Item>
            </Col>
          </Row>
          <Button type="primary" htmlType="submit" size="large" block loading={submitting} style={{ marginTop: 12, height: 50, fontSize: 16 }}>
            Xác Nhận Đặt & Tạo Đơn
          </Button>
        </Form>
      </Modal>

    </div>
  );
};

export default BookingManagement;