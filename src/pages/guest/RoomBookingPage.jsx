import React, { useState } from "react";
import dayjs from "dayjs";
import { Link, useNavigate } from "react-router-dom";
import {
  Layout,
  Breadcrumb,
  Card,
  Form,
  Row,
  Col,
  DatePicker,
  Select,
  Button,
  Typography,
  Space,
  List,
  message,
} from "antd";
import { bookingApi } from "../../services/api";

const { Content } = Layout;
const { Title, Text } = Typography;

const roomTypes = [
  { value: "Deluxe", label: "Phòng Deluxe" },
  { value: "Executive", label: "Phòng Executive" },
  { value: "Suite", label: "Phòng Suite" },
];

const sampleRooms = [
  {
    id: 1,
    name: "Phòng Deluxe Giường Đôi",
    capacity: 2,
    price: "2.100.000đ/đêm",
  },
  {
    id: 2,
    name: "Phòng Executive",
    capacity: 3,
    price: "3.450.000đ/đêm",
  },
  {
    id: 3,
    name: "Phòng Suite",
    capacity: 4,
    price: "4.900.000đ/đêm",
  },
];

const RoomBookingPage = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(sampleRooms);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const handleBookRoom = async (roomTypeData) => {
    try {
      const values = await form.validateFields(['date', 'roomType']);
      const [checkIn, checkOut] = values.date;
      
      const storedUser = JSON.parse(localStorage.getItem('user')) || {};
      const token = localStorage.getItem('token');
      
      // Auto-select the first available physical room
      if (!roomTypeData.availableRooms || roomTypeData.availableRooms.length === 0) {
          message.error("Loại phòng này hiện không còn phòng trống.");
          return;
      }
      const selectedRoomId = roomTypeData.availableRooms[0].id;
      
      const payload = { 
        guestName: storedUser.fullName || "Khách Guest",
        guestPhone: storedUser.phoneNumber || "0123456789",
        guestEmail: storedUser.email || localStorage.getItem('userEmail') || "guest@hotel.com",
        checkIn: checkIn.format('YYYY-MM-DDTHH:mm:ss'), 
        checkOut: checkOut.format('YYYY-MM-DDTHH:mm:ss'), 
        selectedRoomIds: [selectedRoomId] 
      };

      const response = await fetch('https://localhost:5070/api/Bookings/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
          throw new Error("Lỗi khi tạo đơn đặt phòng trên hệ thống.");
      }
      
      message.success(`Đã đặt ${roomTypeData.roomTypeName} thành công! Đơn đã lưu vào hệ thống Admin.`);
      navigate('/guest/bookings');
    } catch (errorInfo) {
      console.error(errorInfo);
      message.error(errorInfo.message || 'Lỗi đặt phòng. Bạn đã chọn ngày chưa?');
    }
  };

  const handleSearch = async (values) => {
    const { date, roomType } = values;

    if (!date || date.length !== 2) {
      message.error("Vui lòng chọn ngày nhận và trả phòng.");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const payload = {
        checkIn: date[0].format("YYYY-MM-DDTHH:mm:ss"),
        checkOut: date[1].format("YYYY-MM-DDTHH:mm:ss"),
        adults: 2,
        children: 0
      };
      
      const response = await fetch('https://localhost:5070/api/Bookings/available-rooms', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) throw new Error('API request failed');
      const data = await response.json();
      
      // Filter by roomType if necessary, for now show all types that have available rooms
      const availableTypes = data.filter(t => t.availableRooms && t.availableRooms.length > 0);
      setResults(availableTypes);
      message.success("Đã tìm thấy phòng khả dụng.");
    } catch (error) {
      message.error("Không tìm được phòng. Vẫn hiển thị dữ liệu mẫu để test giao diện.");
      // Fallback to sample data structured similarly to backend response
      setResults([
        {
          roomTypeId: 999,
          roomTypeName: roomType || "Phòng Deluxe",
          pricePerNight: 2100000,
          capacityAdults: 2,
          capacityChildren: 1,
          availableRooms: [
            { id: 101, roomNumber: "101", floor: 1 }
          ]
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout style={{ minHeight: "100vh", background: "#f4f5f7" }}>
      <Content style={{ padding: "40px 50px" }}>
        <Breadcrumb separator=">" style={{ marginBottom: 24 }}>
          <Breadcrumb.Item>
            <Link to="/guest/dashboard">Dashboard</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Đặt phòng</Breadcrumb.Item>
        </Breadcrumb>

        <Card style={{ borderRadius: 18, boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}>
          <Title level={3}>Đặt phòng mới</Title>
          <Text type="secondary">
            Chọn ngày và loại phòng, sau đó nhấn tìm phòng để xem những căn phòng còn trống.
          </Text>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSearch}
            style={{ marginTop: 24 }}
          >
            <Row gutter={24}>
              <Col xs={24} md={10}>
                <Form.Item
                  name="date"
                  label="Ngày nhận / trả"
                  rules={[{ required: true, message: "Vui lòng chọn khoảng thời gian." }]}
                >
                  <DatePicker.RangePicker
                    style={{ width: "100%" }}
                    disabledDate={(current) => current && current < dayjs().startOf("day")}
                  />
                </Form.Item>
              </Col>
              <Col xs={24} md={8}>
                <Form.Item
                  name="roomType"
                  label="Loại phòng"
                  rules={[{ required: true, message: "Vui lòng chọn loại phòng." }]}
                >
                  <Select options={roomTypes} placeholder="Chọn loại phòng" />
                </Form.Item>
              </Col>
              <Col xs={24} md={6} style={{ display: "flex", alignItems: "flex-end" }}>
                <Form.Item>
                  <Button
                    type="primary"
                    htmlType="submit"
                    size="large"
                    loading={loading}
                    style={{ width: "100%" }}
                  >
                    Tìm phòng
                  </Button>
                </Form.Item>
              </Col>
            </Row>
          </Form>
        </Card>

        <Card
          title="Phòng khả dụng"
          style={{ marginTop: 24, borderRadius: 18 }}
        >
          <List
            dataSource={results}
            renderItem={(type) => (
              <List.Item
                actions={[
                  <Button key="book" type="primary" onClick={() => handleBookRoom(type)}>
                    Đặt phòng
                  </Button>
                ]}
              >
                <List.Item.Meta
                  title={type.roomTypeName}
                  description={
                    <Space size="large">
                      <Text>{type.capacityAdults} NL {type.capacityChildren} TE</Text>
                      <Text strong>{new Intl.NumberFormat('vi-VN').format(type.pricePerNight)}đ/đêm</Text>
                      <Text type="secondary">Còn {type.availableRooms?.length || 0} phòng trống</Text>
                    </Space>
                  }
                />
              </List.Item>
            )}
          />
        </Card>
      </Content>
    </Layout>
  );
};

export default RoomBookingPage;
