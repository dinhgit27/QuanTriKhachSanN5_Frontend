import React, { useState, useEffect } from "react";
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
  Tag,
  Empty,
  Spin,
  InputNumber,
} from "antd";
import { HomeOutlined, CalendarOutlined, SearchOutlined, UserOutlined, TeamOutlined } from "@ant-design/icons";

const { Content } = Layout;
const { Title, Text } = Typography;

const RoomBookingPage = () => {
  const [loading, setLoading] = useState(false);
  const [allResults, setAllResults] = useState([]);
  const [filteredResults, setFilteredResults] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [searched, setSearched] = useState(false);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  useEffect(() => {
    fetchRoomTypes();
    const today = dayjs();
    const tomorrow = today.add(2, 'day');
    form.setFieldsValue({ 
      date: [today, tomorrow], 
      roomType: "All",
      adults: 2,
      children: 0
    });
    handleSearchAuto(today, tomorrow);
  }, []);

  const fetchRoomTypes = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
      const response = await fetch('http://localhost:5070/api/RoomTypes', { headers });
      if (response.ok) {
        const data = await response.json();
        const types = data.map(t => ({ value: t.name, label: t.name }));
        setRoomTypes([{ value: "All", label: "Tất cả loại phòng" }, ...types]);
      }
    } catch (error) {
      console.error("Error fetching room types:", error);
    }
  };

  const handleSearchAuto = async (checkIn, checkOut) => {
    setLoading(true);
    try {
      const payload = {
        checkIn: checkIn.format("YYYY-MM-DDTHH:mm:ss"),
        checkOut: checkOut.format("YYYY-MM-DDTHH:mm:ss"),
        adults: 2,
        children: 0
      };

      const response = await fetch('http://localhost:5070/api/Bookings/available-rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('API failed');
      const data = await response.json();
      const available = data.filter(t => t.availableRooms && t.availableRooms.length > 0);
      setAllResults(available);
      setFilteredResults(available);
      setSearched(true);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (values) => {
    const { date, roomType, adults, children } = values;
    if (!date || date.length !== 2) {
      message.error("Vui lòng chọn ngày nhận và trả phòng.");
      return;
    }

    setLoading(true);
    setSearched(false);
    try {
      const payload = {
        checkIn: date[0].format("YYYY-MM-DDTHH:mm:ss"),
        checkOut: date[1].format("YYYY-MM-DDTHH:mm:ss"),
        adults: adults || 1,
        children: children || 0
      };

      const response = await fetch('http://localhost:5070/api/Bookings/available-rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('API request failed');
      const data = await response.json();

      const availableTypes = data.filter(t => t.availableRooms && t.availableRooms.length > 0);
      setAllResults(availableTypes);
      
      if (roomType && roomType !== "All") {
        setFilteredResults(availableTypes.filter(t => t.roomTypeName === roomType));
      } else {
        setFilteredResults(availableTypes);
      }
      
      setSearched(true);
      if (availableTypes.length > 0) {
        message.success(`Đã tìm thấy ${availableTypes.length} loại phòng phù hợp!`);
      } else {
        message.warning("Không có phòng trống phù hợp với yêu cầu của bạn.");
      }
    } catch (error) {
      message.error("Lỗi kết nối. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleBookRoom = async (roomTypeData) => {
    try {
      const values = await form.validateFields();
      const [checkIn, checkOut] = values.date;

      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      const token = localStorage.getItem('token');
      
      if (!token) {
        message.warning("Vui lòng đăng nhập để đặt phòng.");
        navigate("/login");
        return;
      }

      const selectedRoomId = roomTypeData.availableRooms[0].id;

      const payload = {
        guestName: storedUser.fullName || storedUser.userName || "Khách Guest",
        guestPhone: storedUser.phoneNumber || "0123456789",
        guestEmail: storedUser.email || localStorage.getItem('userEmail') || "guest@hotel.com",
        checkIn: checkIn.format('YYYY-MM-DDTHH:mm:ss'),
        checkOut: checkOut.format('YYYY-MM-DDTHH:mm:ss'),
        selectedRoomIds: [selectedRoomId]
      };

      const response = await fetch('http://localhost:5070/api/Bookings/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const resData = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(resData.message || "Lỗi khi tạo đơn đặt phòng.");
      }

      message.success(`Đặt phòng ${roomTypeData.roomTypeName} thành công!`);
      navigate('/guest/bookings');
    } catch (errorInfo) {
      console.error(errorInfo);
      message.error(errorInfo.message || 'Lỗi đặt phòng. Vui lòng thử lại.');
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
          <Title level={3} style={{ margin: 0 }}>
            <HomeOutlined style={{ marginRight: 8, color: '#1890ff' }} />
            Tìm phòng trống
          </Title>
          <Text type="secondary">
            Nhập thông tin để xem danh sách phòng còn trống cho chuyến đi của bạn.
          </Text>

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSearch}
            style={{ marginTop: 24 }}
          >
            <Row gutter={[24, 16]} align="bottom">
              <Col xs={24} md={10}>
                <Form.Item
                  name="date"
                  label={<><CalendarOutlined style={{ marginRight: 4 }} />Thời gian nhận / trả</>}
                  rules={[{ required: true, message: "Chọn ngày!" }]}
                >
                  <DatePicker.RangePicker style={{ width: "100%" }} size="large" format="DD/MM/YYYY" />
                </Form.Item>
              </Col>
              <Col xs={24} md={7}>
                <Form.Item name="roomType" label="Loại phòng ưu tiên">
                  <Select size="large" options={roomTypes} />
                </Form.Item>
              </Col>
              <Col xs={12} md={3}>
                <Form.Item name="adults" label={<><UserOutlined /> NL</>}>
                  <InputNumber min={1} max={10} style={{ width: "100%" }} size="large" />
                </Form.Item>
              </Col>
              <Col xs={12} md={3}>
                <Form.Item name="children" label={<><TeamOutlined /> TE</>}>
                  <InputNumber min={0} max={10} style={{ width: "100%" }} size="large" />
                </Form.Item>
              </Col>
              <Col xs={24} md={24}>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={loading}
                  icon={<SearchOutlined />}
                  style={{ width: "100%", height: 50, borderRadius: 10, fontSize: 18 }}
                >
                  Kiểm tra phòng trống
                </Button>
              </Col>
            </Row>
          </Form>
        </Card>

        <Card
          title={
            <span>
              Kết quả tìm kiếm
              {filteredResults.length > 0 && (
                <Tag color="blue" style={{ marginLeft: 8 }}>
                  {filteredResults.reduce((acc, curr) => acc + (curr.availableRooms?.length || 0), 0)} phòng trống
                </Tag>
              )}
            </span>
          }
          style={{ marginTop: 24, borderRadius: 18 }}
        >
          <Spin spinning={loading}>
            {filteredResults.length === 0 && searched && !loading ? (
              <Empty description="Không tìm thấy phòng phù hợp với tiêu chí của bạn." />
            ) : (
              <List
                dataSource={filteredResults}
                renderItem={(type) => {
                  const numNights = (() => {
                    try {
                      const v = form.getFieldValue('date');
                      if (v && v[0] && v[1]) return v[1].diff(v[0], 'day');
                    } catch {}
                    return 1;
                  })();
                  const totalPrice = type.pricePerNight * numNights;

                  return (
                    <List.Item
                      actions={[
                        <Button
                          key="book"
                          type="primary"
                          size="large"
                          onClick={() => handleBookRoom(type)}
                          style={{ borderRadius: 8 }}
                        >
                          Đặt ngay
                        </Button>
                      ]}
                      style={{ padding: '20px 0' }}
                    >
                      <List.Item.Meta
                        title={
                          <Text strong style={{ fontSize: 18 }}>
                            {type.roomTypeName}
                          </Text>
                        }
                        description={
                          <Space size="large" wrap style={{ marginTop: 8 }}>
                            <Text>
                              <UserOutlined /> Tối đa {type.capacityAdults} NL, {type.capacityChildren} TE
                            </Text>
                            <Text strong style={{ color: '#1890ff', fontSize: 16 }}>
                              {new Intl.NumberFormat('vi-VN').format(type.pricePerNight)}đ / đêm
                            </Text>
                            {numNights > 1 && (
                              <Tag color="gold">Tổng {numNights} đêm: {new Intl.NumberFormat('vi-VN').format(totalPrice)}đ</Tag>
                            )}
                            <Tag color="green" style={{ fontSize: 14 }}>
                              Còn {type.availableRooms?.length || 0} phòng trống
                            </Tag>
                          </Space>
                        }
                      />
                    </List.Item>
                  );
                }}
              />
            )}
          </Spin>
        </Card>
      </Content>
    </Layout>
  );
};

export default RoomBookingPage;
