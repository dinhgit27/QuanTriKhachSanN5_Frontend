import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Tabs, Divider } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, PhoneOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';

const { TabPane } = Tabs;

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('login');
  const navigate = useNavigate();
  const [loginForm] = Form.useForm();
  const [registerForm] = Form.useForm();

  // Hàm helper để giải mã JWT Token (Chuẩn chuyên nghiệp)
  const decodeToken = (token) => {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        window.atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  const onLoginFinish = async (values) => {
    setLoading(true);
    try {
      // 1. Gọi API Login
      const response = await authAPI.login({
        email: values.username, // Backend C# yêu cầu trường 'email'
        password: values.password
      });

      const token = response.data.token;

      if (token) {
        // 2. Lưu token vào localStorage
        localStorage.setItem('token', token);

        // 3. Giải mã token để lấy thông tin User & Role
        const payload = decodeToken(token);
        console.log("Token Payload:", payload);

        // C# Identity thường lưu role trong claim này hoặc 'role'
        const role = payload?.role || payload?.['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
        
        if (role) {
          localStorage.setItem('role', role);
          message.success(`Chào mừng ${role} quay trở lại!`);

          // 4. CHUYỂN TRANG (Dùng setTimeout để đảm bảo localStorage đã kịp lưu)
          setTimeout(() => {
            if (role.toLowerCase() === 'admin') {
              navigate('/admin');
            } else {
              navigate('/user');
            }
          }, 100);
        } else {
          message.warning('Đăng nhập thành công nhưng không tìm thấy quyền hạn!');
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMsg = error.response?.data?.message || 'Email hoặc mật khẩu không đúng!';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const onRegisterFinish = async (values) => {
    setLoading(true);
    try {
      await authAPI.register({
        username: values.username,
        email: values.email,
        password: values.password,
        phone: values.phone,
        fullName: values.fullName
      });

      message.success('Đăng ký thành công! Bạn có thể đăng nhập ngay.');
      setActiveTab('login');
      registerForm.resetFields();
    } catch (error) {
      console.error('Register error:', error);
      message.error(error.response?.data?.message || 'Đăng ký thất bại, vui lòng thử lại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      display: 'flex', justifyContent: 'center', alignItems: 'center',
      minHeight: '100vh', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <Card
        hoverable
        style={{ width: 450, borderRadius: '15px', overflow: 'hidden' }}
        bodyStyle={{ padding: '40px' }}
      >
        <Tabs activeKey={activeTab} onChange={setActiveTab} centered size="large">
          <TabPane tab="ĐĂNG NHẬP" key="login">
            <div style={{ textAlign: 'center', marginBottom: '25px' }}>
              <h2 style={{ color: '#1890ff' }}>Hệ Thống Quản Lý</h2>
              <p style={{ color: '#8c8c8c' }}>Vui lòng đăng nhập để tiếp tục</p>
            </div>

            <Form form={loginForm} onFinish={onLoginFinish} layout="vertical">
              <Form.Item
                name="username"
                label="Email / Tên đăng nhập"
                rules={[{ required: true, message: 'Vui lòng nhập email!' }]}
              >
                <Input prefix={<UserOutlined />} placeholder="admin@test.com" size="large" />
              </Form.Item>

              <Form.Item
                name="password"
                label="Mật khẩu"
                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
              >
                <Input.Password prefix={<LockOutlined />} placeholder="123456" size="large" />
              </Form.Item>

              <Button type="primary" htmlType="submit" loading={loading} block size="large" style={{ height: '45px', marginTop: '10px' }}>
                ĐĂNG NHẬP
              </Button>
            </Form>
          </TabPane>

          <TabPane tab="ĐĂNG KÝ" key="register">
            <Form form={registerForm} onFinish={onRegisterFinish} layout="vertical">
              <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true }]}>
                <Input prefix={<UserOutlined />} placeholder="Nguyễn Văn A" />
              </Form.Item>
              <Form.Item name="email" label="Email" rules={[{ required: true, type: 'email' }]}>
                <Input prefix={<MailOutlined />} placeholder="example@gmail.com" />
              </Form.Item>
              <Form.Item name="phone" label="Số điện thoại" rules={[{ required: true }]}>
                <Input prefix={<PhoneOutlined />} placeholder="090xxxxxxx" />
              </Form.Item>
              <Form.Item name="username" label="Tên tài khoản" rules={[{ required: true }]}>
                <Input prefix={<UserOutlined />} placeholder="user123" />
              </Form.Item>
              <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, min: 6 }]}>
                <Input.Password prefix={<LockOutlined />} />
              </Form.Item>
              <Button type="primary" htmlType="submit" loading={loading} block style={{ background: '#52c41a', borderColor: '#52c41a' }}>
                TẠO TÀI KHOẢN
              </Button>
            </Form>
          </TabPane>
        </Tabs>

        <Divider plain><span style={{ color: '#ccc', fontWeight: 'normal', fontSize: '12px' }}>THÔNG TIN HỖ TRỢ</span></Divider>
        
        <div style={{ textAlign: 'center', fontSize: '13px', background: '#f5f5f5', padding: '10px', borderRadius: '8px' }}>
          <p style={{ marginBottom: '5px' }}><strong>Tài khoản mẫu:</strong></p>
          <div style={{ display: 'flex', justifyContent: 'space-around' }}>
             <span>Admin: 123456</span>
             <span>User: 123456</span>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Login;