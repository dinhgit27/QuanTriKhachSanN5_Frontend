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

  const onLoginFinish = async (values) => {
    setLoading(true);
    try {
      const response = await authAPI.login({
        username: values.username,
        password: values.password
      });

      // Lưu ý: Đảm bảo cấu trúc response của bạn trùng khớp với Backend trả về.
      // Nếu Backend bọc kết quả trong biến 'data' (ví dụ: { success: true, data: { token: "..." } })
      // thì phải gọi là response.data.data.token
      const token = response.data.token;
      const user = response.data.user;

      // Lưu token và thông tin user
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));

      message.success('Đăng nhập thành công!');

      // Redirect dựa trên role (Fix lỗi chữ hoa/chữ thường)
      const userRole = user?.role?.toLowerCase(); // Chuyển "Admin" thành "admin"
      if (userRole === 'admin' || userRole === 'receptionist' || userRole === 'housekeeping') {
        navigate('/admin'); // Hoặc '/admin/dashboard'
      } else {
        navigate('/user'); // Khách hàng bình thường
      }
    } catch (error) {
      console.error('Login error:', error);
      message.error(error.response?.data?.message || 'Đăng nhập thất bại!');
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

      message.success('Đăng ký thành công! Vui lòng đăng nhập.');
      setActiveTab('login');
      registerForm.resetFields();
    } catch (error) {
      console.error('Register error:', error);
      message.error(error.response?.data?.message || 'Đăng ký thất bại!');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    message.info('Tính năng quên mật khẩu đang được phát triển!');
  };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '20px'
    }}>
      <Card
        style={{
          width: 450,
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
          borderRadius: '10px'
        }}
        bodyStyle={{ padding: '40px' }}
      >
        <Tabs activeKey={activeTab} onChange={setActiveTab} centered>
          <TabPane tab="Đăng Nhập" key="login">
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <h2 style={{ color: '#1890ff', marginBottom: '10px' }}>Đăng Nhập</h2>
              <p style={{ color: '#666' }}>Chào mừng bạn quay trở lại</p>
            </div>

            <Form
              form={loginForm}
              onFinish={onLoginFinish}
              layout="vertical"
            >
              <Form.Item
                name="username"
                label="Tên Đăng Nhập"
                rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="Nhập tên đăng nhập"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="password"
                label="Mật Khẩu"
                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu!' }]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Nhập mật khẩu"
                  size="large"
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  size="large"
                  style={{ height: '50px', fontSize: '16px', marginBottom: '10px' }}
                >
                  Đăng Nhập
                </Button>
              </Form.Item>

              <div style={{ textAlign: 'center' }}>
                <Button type="link" onClick={handleForgotPassword}>
                  Quên mật khẩu?
                </Button>
              </div>
            </Form>
          </TabPane>

          <TabPane tab="Đăng Ký" key="register">
            <div style={{ textAlign: 'center', marginBottom: '30px' }}>
              <h2 style={{ color: '#52c41a', marginBottom: '10px' }}>Đăng Ký Tài Khoản</h2>
              <p style={{ color: '#666' }}>Tạo tài khoản mới để sử dụng hệ thống</p>
            </div>

            <Form
              form={registerForm}
              onFinish={onRegisterFinish}
              layout="vertical"
            >
              <Form.Item
                name="fullName"
                label="Họ và Tên"
                rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="Nhập họ và tên"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Vui lòng nhập email!' },
                  { type: 'email', message: 'Email không hợp lệ!' }
                ]}
              >
                <Input
                  prefix={<MailOutlined />}
                  placeholder="Nhập email"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="phone"
                label="Số Điện Thoại"
                rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
              >
                <Input
                  prefix={<PhoneOutlined />}
                  placeholder="Nhập số điện thoại"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="username"
                label="Tên Đăng Nhập"
                rules={[{ required: true, message: 'Vui lòng nhập tên đăng nhập!' }]}
              >
                <Input
                  prefix={<UserOutlined />}
                  placeholder="Nhập tên đăng nhập"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="password"
                label="Mật Khẩu"
                rules={[
                  { required: true, message: 'Vui lòng nhập mật khẩu!' },
                  { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' }
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Nhập mật khẩu"
                  size="large"
                />
              </Form.Item>

              <Form.Item
                name="confirmPassword"
                label="Xác Nhận Mật Khẩu"
                dependencies={['password']}
                rules={[
                  { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('password') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                    },
                  }),
                ]}
              >
                <Input.Password
                  prefix={<LockOutlined />}
                  placeholder="Xác nhận mật khẩu"
                  size="large"
                />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={loading}
                  block
                  size="large"
                  style={{ height: '50px', fontSize: '16px' }}
                >
                  Đăng Ký
                </Button>
              </Form.Item>
            </Form>
          </TabPane>
        </Tabs>

        <Divider />

        <div style={{ textAlign: 'center', color: '#666', fontSize: '14px' }}>
          <p><strong>Tài khoản demo:</strong></p>
          <p>Admin: admin / admin123</p>
          <p>User: user / user123</p>
        </div>
      </Card>
    </div>
  );
};

export default Login;