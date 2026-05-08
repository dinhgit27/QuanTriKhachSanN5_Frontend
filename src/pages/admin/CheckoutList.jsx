import React, { useState, useEffect } from 'react';
import { Card, Typography, Table, Tag, Button, Space, message, Modal, Divider, List, Tooltip } from 'antd';
import { LogoutOutlined, ExclamationCircleOutlined, EyeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import dayjs from 'dayjs';
import invoiceAPI from '../../api/invoiceAPI';

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
  const [momoData, setMomoData] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5070/api/Bookings/in-house', { headers: { Authorization: `Bearer ${token}` } });
      setData(res.data);
    } catch (error) { message.error("Lỗi khi tải danh sách trả phòng!"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  // 🚨 HÀM XEM CHI TIẾT TIÊU THỤ TRƯỚC KHI TRẢ PHÒNG
  const handleViewDetails = async (record) => {
    setSelectedBooking(record);
    setMomoData(null);
    try {
      const res = await invoiceAPI.preview(record.id);
      setBookingDetails(res.data);
      setIsDetailModalOpen(true);

      // Gọi API MoMo để sinh mã QR thanh toán
      try {
        const momoRes = await invoiceAPI.createMomoPayment(record.id);
        setMomoData(momoRes.data);
      } catch (err) {
        console.error("Lỗi tạo QR MoMo:", err);
      }
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
          // 1. Gọi API chốt trả phòng
          const res = await axios.post(`http://localhost:5070/api/Invoices/checkout/${record.id}`);
          message.success("Trả phòng thành công!");
          
          // 2. 🚨 ĐÃ FIX LUỒNG: Xóa cờ thanh toán tạm và nhảy sang trang In Hóa Đơn!
          const paidBookings = JSON.parse(localStorage.getItem('adminPaidBookings') || '[]');
          localStorage.setItem('adminPaidBookings', JSON.stringify(paidBookings.filter(id => id !== record.id)));
          
          const newInvoiceId = res.data.invoiceId; 
          navigate(`/admin/invoice/${newInvoiceId}`); 
          
        } catch (err) { 
          message.error("Lỗi khi xử lý trả phòng!"); 
        }
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
      title: 'Thanh toán', align: 'center',
      render: (_, record) => {
        const paidBookings = JSON.parse(localStorage.getItem('adminPaidBookings') || '[]');
        const isPaid = paidBookings.includes(record.id);
        
        const guestRequests = JSON.parse(localStorage.getItem('guestPaymentRequests') || '[]');
        const isRequested = guestRequests.includes(record.id);

        if (isPaid) return <Tag color="green">Đã nhận tiền</Tag>;
        
        return (
            <Space direction="vertical" size="small">
                {isRequested ? <Tag color="orange">Khách báo đã chuyển</Tag> : <Tag color="default">Chưa thanh toán</Tag>}
                <Button 
                    size="small" 
                    type="primary" 
                    ghost 
                    onClick={() => handleApprovePayment(record.id)}
                >
                    Xác nhận đã nhận tiền
                </Button>
            </Space>
        );
      }
    },
    {
      title: 'Thao tác', align: 'center', render: (_, record) => {
        const paidBookings = JSON.parse(localStorage.getItem('adminPaidBookings') || '[]');
        const isPaid = paidBookings.includes(record.id);
        return (
          <Space>
            <Tooltip title="Xem chi tiết tiêu thụ">
              <Button icon={<EyeOutlined />} onClick={() => handleViewDetails(record)} />
            </Tooltip>
            <Button 
                type="primary" 
                danger 
                icon={<LogoutOutlined />} 
                disabled={!isPaid}
                onClick={() => handleCheckout(record)}
            >
              Trả phòng
            </Button>
          </Space>
        );
      }
    }
  ];

  const handleApprovePayment = (id) => {
    // 1. Xóa khỏi danh sách yêu cầu
    const currentRequests = JSON.parse(localStorage.getItem('guestPaymentRequests') || '[]');
    const updatedRequests = currentRequests.filter(reqId => reqId !== id);
    localStorage.setItem('guestPaymentRequests', JSON.stringify(updatedRequests));

    // 2. Thêm vào danh sách đã thanh toán
    const paidBookings = JSON.parse(localStorage.getItem('adminPaidBookings') || '[]');
    if (!paidBookings.includes(id)) {
      localStorage.setItem('adminPaidBookings', JSON.stringify([...paidBookings, id]));
    }

    message.success("Đã xác nhận khách thanh toán thành công!");
    fetchData(); // Reload table
  };

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

            <div style={{ textAlign: "center", marginTop: 24 }}>
                <Title level={5}>Thanh toán qua MoMo</Title>
                {momoData ? (
                    <>
                        <img src={momoData.qrCodeUrl} alt="MoMo QR Code" width={180} style={{ margin: "auto", display: "block", borderRadius: 8, border: "1px solid #ddd" }} />
                        <div style={{ marginTop: 16 }}>
                            <Button type="primary" href={momoData.payUrl} target="_blank">
                                Mở trang thanh toán
                            </Button>
                        </div>
                    </>
                ) : (
                    <Text type="secondary">Đang tải mã thanh toán MoMo...</Text>
                )}
            </div>
          </div>
        )}
      </Modal>
    </Card>
  );
};

export default CheckoutList;