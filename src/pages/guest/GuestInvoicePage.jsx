import React, { useEffect, useState } from 'react';
import { Layout, Breadcrumb, Card, List, Typography, Tag, Space, Divider, Button, message, Spin } from 'antd';
import { Link } from 'react-router-dom';
import dayjs from 'dayjs';

const { Content } = Layout;
const { Title, Text } = Typography;

const GuestInvoicePage = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [paymentRequests, setPaymentRequests] = useState([]);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const storedUser = JSON.parse(localStorage.getItem('user')) || {};
      const userEmail = storedUser?.email || localStorage.getItem('userEmail') || 'guest@hotel.com';
      const token = localStorage.getItem('token');
      
      const response = await fetch('https://localhost:5070/api/Bookings', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error("API call failed");
      
      const data = await response.json();
      const myBookings = data.filter(b => b.guestEmail === userEmail || b.guestName === storedUser.fullName);
      
      // Get payment requests
      const savedRequests = JSON.parse(localStorage.getItem('guestPaymentRequests') || '[]');
      setPaymentRequests(savedRequests);
      
      const invoiceItems = myBookings.map((b) => ({
        ...b,
        invoiceNumber: `INV-${b.bookingCode}`,
        isPaymentRequested: savedRequests.includes(b.id),
      }));
      
      setInvoices(invoiceItems);
    } catch (err) {
      console.error(err);
      message.error("Lỗi tải hóa đơn từ hệ thống.");
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = (invoice) => {
    try {
      const savedRequests = JSON.parse(localStorage.getItem('guestPaymentRequests') || '[]');
      if (!savedRequests.includes(invoice.id)) {
        savedRequests.push(invoice.id);
        localStorage.setItem('guestPaymentRequests', JSON.stringify(savedRequests));
      }
      
      setPaymentRequests(savedRequests);
      setInvoices(prev => prev.map(inv => {
        if (inv.id === invoice.id) {
          return { ...inv, isPaymentRequested: true };
        }
        return inv;
      }));

      message.success('Đã gửi yêu cầu thanh toán. Vui lòng đợi Quản lý xác nhận!');
    } catch (e) {
      message.error("Lỗi khi gửi yêu cầu.");
    }
  };

  const getStatusTag = (invoice) => {
    if (invoice.status === 'Completed') return <Tag color="green">Đã thanh toán</Tag>;
    if (invoice.status === 'Cancelled') return <Tag color="red">Đã hủy</Tag>;
    if (invoice.isPaymentRequested) return <Tag color="orange">Chờ xác nhận</Tag>;
    return <Tag color="blue">Chưa thanh toán</Tag>;
  };

  return (
    <Layout style={{ minHeight: "100vh", background: "#f4f5f7" }}>
      <Content style={{ padding: "40px 50px" }}>
        <Breadcrumb separator=">" style={{ marginBottom: 24 }}>
          <Breadcrumb.Item>
            <Link to="/guest/dashboard">Dashboard</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Hóa đơn</Breadcrumb.Item>
        </Breadcrumb>

        <Card style={{ borderRadius: 18, boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}>
          <Title level={3}>Hóa đơn của tôi</Title>
          <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
            Quản lý và thanh toán các hóa đơn đặt phòng của bạn.
          </Text>

          <Spin spinning={loading}>
            {invoices.length === 0 ? (
              <Text>Bạn chưa có hóa đơn nào.</Text>
            ) : (
              <List
                dataSource={invoices}
                renderItem={(invoice) => (
                  <List.Item
                    style={{
                      background: '#fff',
                      borderRadius: 12,
                      marginBottom: 16,
                      padding: 24,
                      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                      border: '1px solid #f0f0f0'
                    }}
                  >
                    <List.Item.Meta
                      title={
                        <Space size="middle">
                          <Title level={5} style={{ margin: 0 }}>Hóa đơn #{invoice.invoiceNumber}</Title>
                          {getStatusTag(invoice)}
                        </Space>
                      }
                      description={
                        <Space direction="vertical" style={{ width: '100%', marginTop: 8 }}>
                          <Text>Ngày đặt: {dayjs(invoice.checkInDate).format('DD/MM/YYYY')}</Text>
                          <Space split={<Divider type="vertical" />}>
                            <Text>Mã đặt phòng: <Text strong>{invoice.bookingCode}</Text></Text>
                            <Text>Tổng tiền: <Text strong style={{ color: '#ff4d4f' }}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(invoice.totalAmount)}</Text></Text>
                          </Space>
                        </Space>
                      }
                    />
                    <Space direction="vertical" align="end">
                      {invoice.status !== 'Completed' && invoice.status !== 'Cancelled' && !invoice.isPaymentRequested && (
                        <Button type="primary" onClick={() => handlePayment(invoice)}>
                          Thanh toán
                        </Button>
                      )}
                      {(invoice.status === 'Completed' || invoice.isPaymentRequested) && (
                        <Button type="default" disabled>
                          {invoice.status === 'Completed' ? 'Đã thanh toán' : 'Đang xử lý'}
                        </Button>
                      )}
                    </Space>
                  </List.Item>
                )}
              />
            )}
          </Spin>
        </Card>
      </Content>
    </Layout>
  );
};

export default GuestInvoicePage;
