import React, { useState, useEffect } from 'react';
import { Card, Typography, Table, Tag, Button, Space, message, Modal, Divider, List, Tooltip } from 'antd';
import { LogoutOutlined, ExclamationCircleOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { confirm } = Modal;

const CheckoutList = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // State cho Modal xem chi tiết
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('https://localhost:5070/api/Bookings/in-house', { headers: { Authorization: `Bearer ${token}` } });
      setData(res.data);
    } catch (error) { message.error("Lỗi khi tải danh sách trả phòng!"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  // 🚨 HÀM XEM CHI TIẾT TIÊU THỤ TRƯỚC KHI TRẢ PHÒNG
  const handleViewDetails = async (record) => {
    setSelectedBooking(record);
    try {
      const res = await axios.get(`https://localhost:5070/api/Invoices/preview/${record.id}`);
      setBookingDetails(res.data);
      setIsDetailModalOpen(true);
    } catch (err) { message.error("Không lấy được thông tin tiêu thụ!"); }
  };

  const handleCheckout = (record) => {
    confirm({
      title: `Xác nhận Trả phòng cho khách ${record.guestName}?`,
      icon: <ExclamationCircleOutlined />,
      content: 'Hệ thống sẽ chốt Hóa đơn và chuyển trạng thái phòng sang "Cần dọn dẹp".',
      okText: 'Xác nhận',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await axios.post(`https://localhost:5070/api/Invoices/checkout/${record.id}`);
          message.success("Trả phòng thành công!");
          navigate(`/admin/invoices`); 
        } catch (err) { message.error("Lỗi khi xử lý trả phòng!"); }
      }
    });
  };

  const columns = [
    { title: 'Mã Booking', dataIndex: 'bookingCode', render: text => <b>{text}</b> },
    { title: 'Khách hàng', dataIndex: 'guestName', render: text => <b>{text}</b> },
    { 
      title: 'Phòng trả', dataIndex: 'roomNumbers', 
      render: rooms => <Space wrap>{rooms?.map(r => <Tag color="red" key={r}>P.{r}</Tag>)}</Space> 
    },
    { title: 'Ngày Check-in', dataIndex: 'checkInDate', render: date => dayjs(date).format('HH:mm - DD/MM') },
    {
      title: 'Thao tác', align: 'center', render: (_, record) => (
        <Space>
          <Tooltip title="Xem chi tiết tiêu thụ">
            <Button icon={<EyeOutlined />} onClick={() => handleViewDetails(record)} />
          </Tooltip>
          <Button type="primary" danger icon={<LogoutOutlined />} onClick={() => handleCheckout(record)}>
            Trả phòng
          </Button>
        </Space>
      )
    }
  ];

  return (
    <Card style={{ borderRadius: 12, minHeight: '80vh' }} bodyStyle={{ padding: '24px' }}>
      <Title level={4}>🚪 Xử lý Trả phòng (Checkout)</Title>
      <Table style={{ marginTop: 20 }} columns={columns} dataSource={data} rowKey="id" loading={loading} />

      {/* MODAL XEM CHI TIẾT TRƯỚC KHI TRẢ PHÒNG */}
      <Modal 
        title={`Xem trước hóa đơn - ${selectedBooking?.guestName}`} 
        open={isDetailModalOpen} 
        onCancel={() => setIsDetailModalOpen(false)} 
        footer={[<Button key="close" onClick={() => setIsDetailModalOpen(false)}>Đóng</Button>]}
      >
        {bookingDetails && (
          <div>
            <Text strong>Tóm tắt chi phí tính đến hiện tại:</Text>
            <List
              size="small"
              bordered
              style={{ marginTop: 10 }}
              dataSource={[
                { title: 'Tiền phòng', amount: bookingDetails.totalRoomAmount },
                { title: 'Dịch vụ & Phạt', amount: bookingDetails.totalServiceAmount },
                { title: 'Thuế (VAT 8%)', amount: bookingDetails.taxAmount },
              ]}
              renderItem={item => (
                <List.Item style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{item.title}</span>
                  <b>{item.amount?.toLocaleString()} đ</b>
                </List.Item>
              )}
            />
            <Divider />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18 }}>
              <Text strong style={{ color: '#f5222d' }}>TỔNG THANH TOÁN:</Text>
              <Text strong style={{ color: '#f5222d' }}>{bookingDetails.finalTotal?.toLocaleString()} đ</Text>
            </div>
          </div>
        )}
      </Modal>
    </Card>
  );
};

export default CheckoutList;