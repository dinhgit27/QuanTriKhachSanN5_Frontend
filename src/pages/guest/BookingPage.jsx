import React, { useState } from "react";
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

const BookingPage = () => {
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(sampleRooms);
  const [form] = Form.useForm();
  const navigate = useNavigate();

  const handleSearch = async (values) => {
    const { date, roomType } = values;

    if (!date || date.length !== 2) {
      message.error("Vui lòng chọn ngày nhận và trả phòng.");
      return;
    }

    setLoading(true);
    try {
      const payload = {
        roomType,
        checkIn: date[0].format("YYYY-MM-DD"),
        checkOut: date[1].format("YYYY-MM-DD"),
      };
      const response = await bookingApi.searchAvailableRooms(payload);
      const data = response?.data;
      setResults(Array.isArray(data) && data.length > 0 ? data : sampleRooms);
      message.success("Đã tìm thấy phòng khả dụng.");
    } catch (error) {
      message.error("Không tìm được phòng. Hiển thị gợi ý phòng mẫu.");
      setResults(sampleRooms);
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
                  <DatePicker.RangePicker style={{ width: "100%" }} />
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
            renderItem={(room) => (
              <List.Item
                actions={[
                  <Button key="book" type="primary" onClick={() => navigate("/guest/dashboard")}>
                    Đặt phòng
                  </Button>
                ]}
              >
                <List.Item.Meta
                  title={room.name}
                  description={
                    <Space size="large">
                      <Text>{room.capacity} khách</Text>
                      <Text strong>{room.price}</Text>
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

export default BookingPage;
