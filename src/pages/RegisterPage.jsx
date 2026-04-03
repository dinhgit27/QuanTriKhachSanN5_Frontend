import React, { useState } from 'react';
import { Form, Input, Button, Typography, message, Row, Col } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined, BankFilled } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { authAPI } from '../api/authApi';

const { Title, Text } = Typography;

// Bảng màu sang trọng của Grand Hotel
const COLORS = {
  primary: "#e6b83b", // Vàng gold
  dark: "#1a1a1a",
  gray: "#8c8c8c"
};

const RegisterPage = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // GIỮ NGUYÊN LOGIC XỬ LÝ CỦA BẠN
 const onFinish = async (values) => {
    setLoading(true);
    try {
      // 1. ÁO THUẬT TRÁO NHÃN: Chế lại dữ liệu đúng form C# nó đòi
      const payloadToSend = {
        Username: values.fullName, // Tráo fullName thành Username
        Email: values.email,
        Password: values.password,
        // (Tùy Backend: Nếu C# ní có bảng số điện thoại thì thêm dòng dưới)
        // PhoneNumber: values.phoneNumber 
      };

      console.log('Dữ liệu ĐÃ ĐÓNG GÓI LẠI để gửi đi:', payloadToSend);

      // 2. Gửi cục data mới này xuống Backend
      await authAPI.register(payloadToSend); 
      
      message.success('Đăng ký thành công! Đang chuyển hướng...');
      setTimeout(() => navigate('/login'), 1500); 
    } catch (error) {
      // 3. Nếu vẫn lỗi, in ra lỗi cụ thể
      const errorMsg = error.response?.data?.message || 'Lỗi đăng ký, vui lòng thử lại!';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Row style={{ minHeight: "100vh", backgroundColor: "#fff" }}>
      
      {/* CỘT TRÁI: FORM ĐĂNG KÝ */}
      <Col xs={24} md={10} style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        padding: '5% 8%' // Căn lề hai bên cho form thoáng hơn
      }}>
        <div style={{ maxWidth: 400, margin: '0 auto', width: '100%' }}>
          
          {/* Logo & Tiêu đề */}
          <div style={{ textAlign: 'center', marginBottom: 30 }}>
            <div style={{ 
              width: 50, height: 50, background: COLORS.primary, 
              borderRadius: 12, display: 'flex', justifyContent: 'center', 
              alignItems: 'center', margin: '0 auto 15px auto' 
            }}>
              <BankFilled style={{ color: '#fff', fontSize: 24 }} />
            </div>
            <Title level={2} style={{ margin: 0, color: COLORS.dark }}>Đăng ký tài khoản</Title>
            <Text type="secondary">Trở thành thành viên của Grand Hotel</Text>
          </div>

          {/* FORM GIỮ NGUYÊN CÁC TRƯỜNG VÀ VALIDATION CỦA BẠN */}
          <Form layout="vertical" onFinish={onFinish} size="large">
            <Form.Item name="fullName" rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}>
              <Input prefix={<UserOutlined style={{ color: COLORS.gray, marginRight: 8 }}/>} placeholder="Họ và tên" style={{ borderRadius: 8 }}/>
            </Form.Item>

            <Form.Item name="email" rules={[{ required: true, message: 'Vui lòng nhập email!' }, { type: 'email', message: 'Email không hợp lệ!' }]}>
              <Input prefix={<MailOutlined style={{ color: COLORS.gray, marginRight: 8 }}/>} placeholder="Email đăng nhập" style={{ borderRadius: 8 }}/>
            </Form.Item>

            <Form.Item name="phoneNumber">
              <Input prefix={<PhoneOutlined style={{ color: COLORS.gray, marginRight: 8 }}/>} placeholder="Số điện thoại" style={{ borderRadius: 8 }}/>
            </Form.Item>

            <Form.Item name="password" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }, { min: 6, message: 'Mật khẩu ít nhất 6 ký tự!' }]}>
              <Input.Password prefix={<LockOutlined style={{ color: COLORS.gray, marginRight: 8 }}/>} placeholder="Mật khẩu" style={{ borderRadius: 8 }}/>
            </Form.Item>

            <Form.Item name="confirmPassword" dependencies={['password']} rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) return Promise.resolve();
                  return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                },
              }),
            ]}>
              <Input.Password prefix={<LockOutlined style={{ color: COLORS.gray, marginRight: 8 }}/>} placeholder="Xác nhận mật khẩu" style={{ borderRadius: 8 }}/>
            </Form.Item>

            <Form.Item style={{ marginTop: 10 }}>
              <Button 
                type="primary" 
                htmlType="submit" 
                block 
                loading={loading}
                style={{ 
                  background: COLORS.primary, 
                  borderColor: COLORS.primary, 
                  height: 45, 
                  borderRadius: 8,
                  fontWeight: 'bold',
                  fontSize: 16
                }}
              >
                Đăng Ký
              </Button>
            </Form.Item>

            <div style={{ textAlign: 'center', marginTop: 15 }}>
              <Text style={{ color: COLORS.gray }}>
                Đã có tài khoản? <Link to="/login" style={{ color: COLORS.primary, fontWeight: 'bold' }}>Đăng nhập</Link>
              </Text>
            </div>
          </Form>

        </div>
      </Col>

      {/* CỘT PHẢI: HÌNH ẢNH BACKGROUND TỪ CLOUDINARY */}
      <Col xs={0} md={14} style={{
        backgroundImage: `url('https://res.cloudinary.com/dqx8hqmcv/image/upload/v1774629245/trang-dang-ky_hs5ann.jpg')`, 
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative'
      }}>
        {/* Lớp phủ gradient làm nổi bật chữ */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '40%',
          background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)',
          display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', padding: '60px'
        }}>
          <Title level={1} style={{ color: '#fff', margin: 0, fontFamily: 'serif' }}>
            Khởi đầu hành trình
          </Title>
          <Title level={1} style={{ color: '#fff', marginTop: 0, fontFamily: 'serif' }}>
            Trải nghiệm đẳng cấp
          </Title>
          <Text style={{ color: '#e0e0e0', fontSize: 18, marginTop: 10 }}>
            Đăng ký ngay để nhận những đặc quyền dành riêng cho hội viên
          </Text>
        </div>
      </Col>
      
    </Row>
  );
};

export default RegisterPage;