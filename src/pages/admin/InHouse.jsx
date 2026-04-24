import React, { useState, useEffect } from 'react';
import { Card, Typography, Table, Tag, Button, Space, message, Tooltip, Modal, InputNumber, Select, Divider, List, Input } from 'antd';
import { PlusCircleOutlined, EyeOutlined, WarningOutlined } from '@ant-design/icons';
import axios from 'axios';
import dayjs from 'dayjs';

const { Title, Text } = Typography;

const InHouse = () => {
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [depositAmount, setDepositAmount] = useState(0);
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  // State dùng chung
  const [selectedBooking, setSelectedBooking] = useState(null);

  // ==========================================
  // STATE CHO MODAL THÊM DỊCH VỤ
  // ==========================================
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [serviceId, setServiceId] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [servicesList, setServicesList] = useState([]);

  // ==========================================
  // 🚨 STATE CHO MODAL BÁO HỎNG (ĐÃ BỔ SUNG ĐẦY ĐỦ)
  // ==========================================
  const [isDamageModalOpen, setIsDamageModalOpen] = useState(false);
  const [damageDescription, setDamageDescription] = useState('');
  const [damagePrice, setDamagePrice] = useState(0);

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

  // ==========================================
  // CÁC HÀM XỬ LÝ DỊCH VỤ
  // ==========================================
  const handleOpenService = (record) => {
    setSelectedBooking(record);
    setServiceId(null);
    setQuantity(1);
    setIsServiceModalOpen(true);
  };

  const submitDeposit = async () => {
    if (!depositAmount || depositAmount <= 0) {
      return message.warning("Nhập số tiền hợp lệ!");
    }

    try {
      await axios.post(
        `https://localhost:5070/api/Reception/deposit/${selectedBooking.id}`,
        { amount: depositAmount },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        }
      );

      message.success("Đã thêm tiền đặt cọc!");
      setIsDepositModalOpen(false);
      fetchData();
    } catch (err) {
      message.error("Lỗi thêm tiền cọc!");
    }
  };

  const submitOrderService = async () => {
    if (!serviceId) return message.warning("Vui lòng chọn một dịch vụ!");
    try {
      await axios.post(`https://localhost:5070/api/Reception/order-service/${selectedBooking.id}`, {
        serviceId: serviceId, quantity: quantity
      });
      message.success("Đã ghi sổ dịch vụ thành công!");
      setIsServiceModalOpen(false);
    } catch (err) {
      message.error(err.response?.data?.message || "Lỗi khi thêm dịch vụ!");
    }
  };

  // ==========================================
  // 🚨 CÁC HÀM XỬ LÝ BÁO HỎNG / ĐỀN BÙ
  // ==========================================
  const handleOpenDamage = (record) => {
    setSelectedBooking(record);
    setDamageDescription('');
    setDamagePrice(0);
    setIsDamageModalOpen(true);
  };

  const submitReportDamage = async () => {
    if (!damageDescription) return message.warning("Vui lòng nhập lý do (VD: Vỡ ly, Hỏng TV)!");
    if (!damagePrice || damagePrice <= 0) return message.warning("Vui lòng nhập số tiền phạt hợp lệ!");

    try {
      await axios.post(`https://localhost:5070/api/Reception/report-damage/${selectedBooking.id}`, {
        description: damageDescription,
        fineAmount: damagePrice
      });
      message.success("Đã ghi nhận phạt đền bù thành công!");
      setIsDamageModalOpen(false); // Đóng Modal khi thành công
    } catch (err) {
      message.error(err.response?.data?.message || "Lỗi khi báo hỏng đồ!");
    }
  };

  // ==========================================
  // HÀM XEM CHI TIẾT
  // ==========================================
  const handleViewDetails = async (record) => {
    setSelectedBooking(record);
    try {
      const res = await axios.get(`https://localhost:5070/api/Invoices/preview/${record.id}`);
      setBookingDetails(res.data);
      setIsDetailModalOpen(true);
    } catch (err) { message.error("Không lấy được thông tin tiêu thụ của phòng!"); }
  };

  // ==========================================
  // CẤU HÌNH CỘT BẢNG
  // ==========================================
  const columns = [
    { title: 'Mã Booking', dataIndex: 'bookingCode', render: text => <b>{text}</b> },
    { title: 'Khách hàng', dataIndex: 'guestName', render: text => <b>{text || 'Khách vãng lai'}</b> },
    {
      title: 'Phòng đang ở', dataIndex: 'roomNumbers',
      render: rooms => <Space wrap>{rooms?.map(r => <Tag color="orange" key={r}>P.{r}</Tag>)}</Space>
    },
    { title: 'Ngày Check-in', dataIndex: 'checkInDate', render: date => dayjs(date).format('HH:mm - DD/MM') },
    { title: 'Tiền đặt cọc', dataIndex: 'depositAmount', render: amount => amount ? amount.toLocaleString() + ' đ' : '0 đ' },
    {
      title: 'Thao tác', align: 'center', render: (_, record) => (
        <Space>
          <Tooltip title="Xem tiêu thụ">
            <Button icon={<EyeOutlined />} onClick={() => handleViewDetails(record)} />
          </Tooltip>
          <Tooltip title="Đặt cọc">
            <Button onClick={() => {
              setSelectedBooking(record);
              setDepositAmount(0);
              setIsDepositModalOpen(true);
            }}>
              Đặt cọc
            </Button>
          </Tooltip>
          <Tooltip title="Ghi sổ dịch vụ">
            <Button type="dashed" icon={<PlusCircleOutlined />} onClick={() => handleOpenService(record)} style={{ color: '#1890ff', borderColor: '#1890ff' }}>Dịch vụ</Button>
          </Tooltip>
          {/* 🚨 NÚT BÁO HỎNG XUẤT HIỆN Ở ĐÂY */}
          <Tooltip title="Báo hỏng đồ đạc">
            <Button danger icon={<WarningOutlined />} onClick={() => handleOpenDamage(record)}>Báo hỏng</Button>
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

      {/* MODAL ĐẶT CỌC */}
      <Modal
        title="Nhập tiền đặt cọc"
        open={isDepositModalOpen}
        onOk={submitDeposit}
        onCancel={() => setIsDepositModalOpen(false)}
      >
        <p>Khách: <b>{selectedBooking?.guestName}</b></p>

        <InputNumber
          style={{ width: "100%" }}
          min={0}
          step={50000}
          value={depositAmount}
          onChange={setDepositAmount}
          formatter={(value) =>
            `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
          }
        />
      </Modal>

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

      {/* 🚨 MODAL BÁO HỎNG (MỚI THÊM) */}
      <Modal title="Báo hỏng đồ / Phạt đền bù" open={isDamageModalOpen} onOk={submitReportDamage} onCancel={() => setIsDamageModalOpen(false)} okText="Ghi nhận Phạt" okType="danger" cancelText="Hủy">
        <p>Phòng của khách: <b style={{ color: '#f5222d' }}>{selectedBooking?.guestName}</b></p>
        <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <div style={{ marginBottom: 4 }}><b>Lý do / Tên vật dụng hỏng:</b></div>
            <Input placeholder="Ví dụ: Vỡ ly thủy tinh, Làm rách khăn tắm..." value={damageDescription} onChange={(e) => setDamageDescription(e.target.value)} />
          </div>
          <div>
            <div style={{ marginBottom: 4 }}><b>Số tiền phạt (VNĐ):</b></div>
            <InputNumber
              min={0}
              step={10000}
              style={{ width: '100%' }}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
              value={damagePrice}
              onChange={setDamagePrice}
            />
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
                { title: 'Tiền Dịch vụ', amount: bookingDetails.totalServiceAmount },
                { title: 'Tiền Phạt / Đền bù', amount: bookingDetails.totalPenaltyAmount },
                { title: 'Thuế (VAT 8%)', amount: bookingDetails.taxAmount },
              ]}
              renderItem={item => (
                <List.Item style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>{item.title}</span>
                  <b style={{ color: item.title === 'Tiền Phạt / Đền bù' && item.amount > 0 ? '#f5222d' : 'inherit' }}>
                    {item.amount?.toLocaleString()} đ
                  </b>
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