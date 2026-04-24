import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Layout,
  Breadcrumb,
  Card,
  Typography,
  Space,
  List,
  Tag,
  Divider,
  Button,
  Modal,
  Form,
  Rate,
  Input,
  message,
  Spin,
  Descriptions,
  Table
} from "antd";
import { EyeOutlined } from "@ant-design/icons";
import dayjs from "dayjs";

const { Content } = Layout;
const { Title, Text } = Typography;
const { TextArea } = Input;

const BookingPage = () => {
  const [bookedRooms, setBookedRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Review Modal
  const [isReviewModalVisible, setIsReviewModalVisible] = useState(false);
  const [currentReviewRoom, setCurrentReviewRoom] = useState(null);
  const [form] = Form.useForm();

  // Detail Modal
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [bookingDetail, setBookingDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const storedUser = JSON.parse(localStorage.getItem('user')) || {};
      const userEmail = storedUser?.email || localStorage.getItem('userEmail') || 'guest@hotel.com';
      const token = localStorage.getItem('token');
      
      const response = await fetch('https://localhost:5070/api/Bookings', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error("API call failed");
      
      const data = await response.json();
      
      // Filter bookings belonging to this guest
      const myBookings = data.filter(b => b.guestEmail === userEmail || b.guestName === storedUser.fullName);
      
      // We also need to get the local reviewed status
      const savedReviewsKey = `guestReviews_${userEmail}`;
      const savedReviews = localStorage.getItem(savedReviewsKey);
      let reviews = [];
      if (savedReviews) {
        try { reviews = JSON.parse(savedReviews); } catch(e){}
      }
      
      const enrichedBookings = myBookings.map(b => {
        // Find if this booking was reviewed
        const hasReviewed = reviews.some(r => r.roomId === b.id);
        return { ...b, hasReviewed };
      });
      
      setBookedRooms(enrichedBookings);
    } catch (err) {
      console.error(err);
      message.error("Lỗi khi tải danh sách đặt phòng từ hệ thống.");
    } finally {
      setLoading(false);
    }
  };

  const showDetailModal = async (bookingId) => {
    setIsDetailModalVisible(true);
    setLoadingDetail(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`https://localhost:5070/api/Bookings/${bookingId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error("API call failed");
      const data = await response.json();
      setBookingDetail(data);
    } catch (err) {
      message.error("Lỗi khi tải chi tiết phòng.");
      setIsDetailModalVisible(false);
    } finally {
      setLoadingDetail(false);
    }
  };

  const getStatusTag = (status) => {
    const map = { 
      'Pending': { c: 'orange', t: 'Chờ xác nhận' }, 
      'Confirmed': { c: 'blue', t: 'Đã xác nhận' }, 
      'Checked_in': { c: 'geekblue', t: 'Đang ở' }, 
      'Completed': { c: 'green', t: 'Đã thanh toán' }, // Map Completed to Đã thanh toán for guest
      'Cancelled': { c: 'red', t: 'Đã hủy' } 
    };
    const { c, t } = map[status] || { c: 'default', t: status };
    return <Tag color={c}>{t}</Tag>;
  };

  const showReviewModal = (room) => {
    setCurrentReviewRoom(room);
    setIsReviewModalVisible(true);
  };

  const handleReviewCancel = () => {
    setIsReviewModalVisible(false);
    setCurrentReviewRoom(null);
    form.resetFields();
  };

  const handleReviewSubmit = (values) => {
    const storedUser = JSON.parse(localStorage.getItem('user')) || {};
    const userEmail = storedUser?.email || localStorage.getItem('userEmail') || 'guest@hotel.com';
    
    // Save review
    const newReview = {
      id: Date.now(),
      roomId: currentReviewRoom.id,
      roomName: `Mã đơn: ${currentReviewRoom.bookingCode}`,
      rating: values.rating,
      comment: values.comment,
      date: new Date().toLocaleDateString('vi-VN')
    };

    const savedReviewsKey = `guestReviews_${userEmail}`;
    const savedReviews = localStorage.getItem(savedReviewsKey);
    let reviews = [];
    if (savedReviews) {
      try { reviews = JSON.parse(savedReviews); } catch (e) { reviews = []; }
    }
    localStorage.setItem(savedReviewsKey, JSON.stringify([newReview, ...reviews]));

    // Update local state to show 'Đã đánh giá'
    const updatedRooms = bookedRooms.map(r => {
      if (r.id === currentReviewRoom.id) {
        return { ...r, hasReviewed: true };
      }
      return r;
    });
    setBookedRooms(updatedRooms);

    message.success("Cảm ơn bạn đã đánh giá phòng!");
    handleReviewCancel();
  };

  return (
    <Layout style={{ minHeight: "100vh", background: "#f4f5f7" }}>
      <Content style={{ padding: "40px 50px" }}>
        <Breadcrumb separator=">" style={{ marginBottom: 24 }}>
          <Breadcrumb.Item>
            <Link to="/guest/dashboard">Dashboard</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Lịch sử đặt phòng</Breadcrumb.Item>
        </Breadcrumb>

        <Card
          title="Lịch sử đặt phòng của tôi"
          style={{ marginTop: 24, borderRadius: 18, boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}
        >
          <Spin spinning={loading}>
            {bookedRooms.length === 0 ? (
              <Text>Chưa có phòng nào trong lịch sử đặt phòng.</Text>
            ) : (
              <List
                dataSource={bookedRooms}
                renderItem={(booking) => (
                  <List.Item>
                    <List.Item.Meta
                      title={<b>Mã đơn: <span style={{color: '#1890ff'}}>{booking.bookingCode}</span></b>}
                      description={
                        <Space size="large" split={<Divider type="vertical" />}>
                          <Text>Từ: {dayjs(booking.checkInDate).format('DD/MM/YYYY')} - Đến: {dayjs(booking.checkOutDate).format('DD/MM/YYYY')}</Text>
                          <Text strong>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(booking.totalAmount)}</Text>
                        </Space>
                      }
                    />
                    <Space>
                      {getStatusTag(booking.status)}
                      
                      <Button icon={<EyeOutlined />} onClick={() => showDetailModal(booking.id)}>
                        Xem chi tiết
                      </Button>

                      {booking.status === 'Completed' && !booking.hasReviewed && (
                        <Button type="primary" size="small" onClick={() => showReviewModal(booking)}>
                          Đánh giá
                        </Button>
                      )}
                      {booking.status === 'Completed' && booking.hasReviewed && (
                        <Tag color="purple">Đã đánh giá</Tag>
                      )}
                    </Space>
                  </List.Item>
                )}
              />
            )}
          </Spin>
        </Card>

        {/* Modal Xem Chi Tiết */}
        <Modal
          title={<Title level={4} style={{ margin: 0 }}>Chi Tiết Mã Đơn: <span style={{ color: '#1890ff' }}>{bookingDetail?.bookingCode}</span></Title>}
          open={isDetailModalVisible}
          onCancel={() => setIsDetailModalVisible(false)}
          footer={[ <Button key="close" type="primary" onClick={() => setIsDetailModalVisible(false)}>Đóng</Button> ]}
          centered
          width={700}
          destroyOnClose
        >
          <Spin spinning={loadingDetail}>
            {bookingDetail && (
              <div style={{ marginTop: 20 }}>
                <Descriptions bordered column={2} size="small" labelStyle={{ fontWeight: 'bold' }}>
                  <Descriptions.Item label="Khách hàng" span={2}>{bookingDetail.guestName || 'N/A'}</Descriptions.Item>
                  <Descriptions.Item label="Số điện thoại">{bookingDetail.guestPhone || 'N/A'}</Descriptions.Item>
                  <Descriptions.Item label="Trạng thái">{getStatusTag(bookingDetail.status)}</Descriptions.Item>
                  <Descriptions.Item label="Tổng tiền" span={2}>
                    <Text type="danger" strong style={{ fontSize: 16 }}>
                      {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(bookingDetail.totalAmount)}
                    </Text>
                  </Descriptions.Item>
                </Descriptions>

                <Title level={5} style={{ marginTop: 24, marginBottom: 12 }}>Danh sách phòng đã được cấp</Title>
                <Table 
                  dataSource={bookingDetail.details} 
                  rowKey="roomNumber" 
                  pagination={false} 
                  bordered
                  size="small"
                  columns={[
                    { title: 'Số Phòng', dataIndex: 'roomNumber', key: 'roomNumber', render: t => <b style={{color: '#1890ff', fontSize: 16}}>P.{t}</b> },
                    { title: 'Loại phòng', dataIndex: 'roomTypeName', key: 'roomTypeName' },
                    { title: 'Check-in', dataIndex: 'checkIn', render: d => dayjs(d).format('DD/MM/YYYY') },
                    { title: 'Check-out', dataIndex: 'checkOut', render: d => dayjs(d).format('DD/MM/YYYY') },
                    { title: 'Giá / Đêm', dataIndex: 'pricePerNight', render: p => new Intl.NumberFormat('vi-VN').format(p) }
                  ]} 
                />
              </div>
            )}
          </Spin>
        </Modal>

        {/* Modal Đánh giá */}
        <Modal
          title={`Đánh giá đơn ${currentReviewRoom?.bookingCode}`}
          open={isReviewModalVisible}
          onCancel={handleReviewCancel}
          footer={null}
        >
          <Form form={form} layout="vertical" onFinish={handleReviewSubmit}>
            <Form.Item
              name="rating"
              label="Đánh giá sao"
              rules={[{ required: true, message: 'Vui lòng chọn số sao!' }]}
            >
              <Rate />
            </Form.Item>
            <Form.Item
              name="comment"
              label="Nhận xét của bạn"
              rules={[{ required: true, message: 'Vui lòng nhập nhận xét!' }]}
            >
              <TextArea rows={4} placeholder="Chia sẻ trải nghiệm của bạn tại đây..." />
            </Form.Item>
            <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
              <Space>
                <Button onClick={handleReviewCancel}>Hủy</Button>
                <Button type="primary" htmlType="submit">
                  Gửi đánh giá
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Modal>
      </Content>
    </Layout>
  );
};

export default BookingPage;
