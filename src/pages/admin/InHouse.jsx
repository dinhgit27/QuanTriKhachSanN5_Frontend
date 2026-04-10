import React, { useState, useEffect } from 'react';
import { Card, Typography, Table, Tag, Button, Space, message, Tooltip, Modal, InputNumber, Select, Divider, List } from 'antd';
import { PlusCircleOutlined, EyeOutlined } from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const InHouse = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // State Modal Dịch vụ
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [serviceId, setServiceId] = useState(null); 
  const [quantity, setQuantity] = useState(1);
  const [servicesList, setServicesList] = useState([]);

  // State Modal Xem Chi Tiết
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [bookingDetails, setBookingDetails] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const resInHouse = await axios.get('https://localhost:5070/api/Bookings/in-house', { headers: { Authorization: `Bearer ${token}` } });
      setData(resInHouse.data);
      
      const resServices = await axios.get('https://localhost:5070/api/Reception/services-list');
      setServicesList(resServices.data);
    } catch (error) { message.error("Lỗi khi tải dữ liệu!"); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, []);

  // 1. MỞ MODAL THÊM DỊCH VỤ
  const handleOpenService = (record) => {
    setSelectedBooking(record);
    setServiceId(null);
    setQuantity(1);
    setIsServiceModalOpen(true);
  };

  // Gửi API Thêm dịch vụ
  const submitOrderService = async () => {
    if (!serviceId) return message.warning("Vui lòng chọn một dịch vụ!");
    try {
      await axios.post(`https://localhost:5070/api/Reception/order-service/${selectedBooking.id}`, {
        serviceId: serviceId, quantity: quantity
      });
      message.success("Đã ghi sổ dịch vụ thành công!");
      setIsServiceModalOpen(false);
    } catch (err) { 
      // 🚨 ĐÃ FIX: In chính xác lỗi của Database ra màn hình
      message.error(err.response?.data?.message || "Lỗi khi thêm dịch vụ!"); 
    }
  };

  // 2. MỞ MODAL XEM CHI TIẾT (LẤY DỮ LIỆU TỪ PREVIEW INVOICE)
  const handleViewDetails = async (record) => {
    setSelectedBooking(record);
    try {
      // Gọi API xem trước hóa đơn để biết khách đã xài gì
      const res = await axios.get(`https://localhost:5070/api/Invoices/preview/${record.id}`);
      setBookingDetails(res.data);
      setIsDetailModalOpen(true);
    } catch (err) { message.error("Không lấy được thông tin tiêu thụ của phòng!"); }
  };

  const columns = [
    { title: 'Mã Booking', dataIndex: 'bookingCode', render: text => <b>{text}</b> },
    { title: 'Khách hàng', dataIndex: 'guestName', render: text => <b>{text || 'Khách vãng lai'}</b> },
    { 
      title: 'Phòng đang ở', dataIndex: 'roomNumbers', 
      render: rooms => <Space wrap>{rooms?.map(r => <Tag color="orange" key={r}>P.{r}</Tag>)}</Space> 
    },
    { title: 'Ngày Check-in', dataIndex: 'checkInDate', render: date => dayjs(date).format('HH:mm - DD/MM') },
    {
      title: 'Thao tác', align: 'center', render: (_, record) => (
        <Space>
          <Tooltip title="Xem tiêu thụ">
            <Button icon={<EyeOutlined />} onClick={() => handleViewDetails(record)} />
          </Tooltip>
          <Tooltip title="Ghi sổ dịch vụ">
            <Button type="dashed" icon={<PlusCircleOutlined />} onClick={() => handleOpenService(record)} style={{ color: '#1890ff', borderColor: '#1890ff' }}>+ Dịch vụ</Button>
          </Tooltip>
        </Space>
      )
    }
  ];

  return (
    <Card style={{ borderRadius: 12, minHeight: '80vh' }} bodyStyle={{ padding: '24px' }}>
      <Title level={4}>🛌 Khách đang lưu trú (In-House)</Title>
      <Text type="secondary">Nơi theo dõi và ghi sổ dịch vụ phát sinh cho khách.</Text>
      <Table style={{ marginTop: 20 }} columns={columns} dataSource={data} rowKey="id" loading={loading} pagination={{ pageSize: 8 }} />

      {/* MODAL GỌI DỊCH VỤ */}
      <Modal title="Ghi sổ Dịch vụ" open={isServiceModalOpen} onOk={submitOrderService} onCancel={() => setIsServiceModalOpen(false)} okText="Ghi sổ" cancelText="Hủy">
        <p>Phòng của khách: <b style={{ color: '#1890ff' }}>{selectedBooking?.guestName}</b></p>
        <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <div style={{ marginBottom: 4 }}><b>Chọn Dịch vụ:</b></div>
            <Select showSearch style={{ width: '100%' }} placeholder="-- Gõ để tìm dịch vụ --" value={serviceId} onChange={setServiceId} filterOption={(input, option) => (option?.label ?? '').toLowerCase().includes(input.toLowerCase())}
              options={servicesList.map(s => ({ value: s.id, label: `${s.name} - ${s.price?.toLocaleString()}đ` }))}
            />
          </div>
          <div>
            <div style={{ marginBottom: 4 }}><b>Số lượng:</b></div>
            <InputNumber min={1} value={quantity} onChange={setQuantity} style={{ width: 100 }} />
          </div>
        </div>
      </Modal>

      {/* MODAL XEM CHI TIẾT TIÊU THỤ */}
      <Modal title={`Chi tiết phòng - ${selectedBooking?.guestName}`} open={isDetailModalOpen} onCancel={() => setIsDetailModalOpen(false)} footer={[<Button key="close" onClick={() => setIsDetailModalOpen(false)}>Đóng</Button>]}>
        {bookingDetails && (
          <div>
            <p><b>Mã Đơn:</b> {bookingDetails.bookingCode}</p>
            <Divider style={{ margin: '12px 0' }} />
            <Text strong>Ghi nhận tiêu thụ hiện tại:</Text>
            <List
              size="small"
              bordered
              style={{ marginTop: 10 }}
              dataSource={[
                { title: 'Tiền phòng', amount: bookingDetails.totalRoomAmount },
                { title: 'Tiền Dịch vụ & Đền bù', amount: bookingDetails.totalServiceAmount },
                { title: 'Thuế (VAT 8%)', amount: bookingDetails.taxAmount },
              ]}
              renderItem={item => (
                <List.Item style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{item.title}</span>
                  <b>{item.amount?.toLocaleString()} đ</b>
                </List.Item>
              )}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontSize: 16 }}>
              <Text strong style={{ color: 'red' }}>Tổng cộng (Tạm tính):</Text>
              <Text strong style={{ color: 'red' }}>{bookingDetails.finalTotal?.toLocaleString()} đ</Text>
            </div>
            <p style={{ marginTop: 16, color: '#8c8c8c', fontStyle: 'italic', fontSize: 12 }}>* Sang trang "Trả phòng" để thực hiện xuất hóa đơn và chốt sổ.</p>
          </div>
        )}
      </Modal>
    </Card>
  );
};

export default InHouse;