import React, { useState } from 'react';
import { Card, Form, Input, Button, Typography, message } from 'antd';
import { MailOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Title } = Typography;

const ForgotPasswordPage = () => {
  const [loading, setLoading] = useState(false);
  const [isSent, setIsSent] = useState(false); // Trạng thái đã gửi email hay chưa

  const onFinish = async (values) => {
    setLoading(true);
    try {
      // Chỗ này mốt gọi API gửi email khôi phục: await authAPI.forgotPassword(values.email);
      console.log('Gửi yêu cầu khôi phục cho email:', values.email);
      message.success('Đã gửi liên kết khôi phục! Vui lòng kiểm tra email.');
      setIsSent(true);
    } catch (error) {
      message.error('Không tìm thấy email này trong hệ thống!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center', background: 'linear-gradient(135deg, #1890ff 0%, #722ed1 100%)' }}>
      <Card style={{ width: 400, borderRadius: 12, boxShadow: '0 8px 24px rgba(0,0,0,0.1)' }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Title level={3} style={{ margin: 0, color: '#1890ff' }}>HOTEL ERP</Title>
          <p style={{ color: '#8c8c8c' }}>Khôi phục mật khẩu</p>
        </div>

        {!isSent ? (
          <Form layout="vertical" onFinish={onFinish} size="large">
            <p style={{ textAlign: 'center', marginBottom: 20 }}>
              Vui lòng nhập địa chỉ email bạn đã sử dụng để đăng ký. Chúng tôi sẽ gửi một liên kết để đặt lại mật khẩu.
            </p>
            <Form.Item name="email" rules={[{ required: true, message: 'Vui lòng nhập email!' }, { type: 'email', message: 'Email không hợp lệ!' }]}>
              <Input prefix={<MailOutlined />} placeholder="Nhập email của bạn" />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" block loading={loading}>
                Gửi liên kết khôi phục
              </Button>
            </Form.Item>
          </Form>
        ) : (
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <h3 style={{ color: '#52c41a' }}>Đã gửi thành công! ✅</h3>
            <p>Vui lòng kiểm tra hộp thư đến (hoặc hộp thư rác) và làm theo hướng dẫn.</p>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Link to="/login" style={{ color: '#8c8c8c' }}>
            <ArrowLeftOutlined /> Quay lại đăng nhập
          </Link>
        </div>
      </Card>
    </div>
  );
};

export default ForgotPasswordPage;