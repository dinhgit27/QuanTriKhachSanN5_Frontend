import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useAdminAuthStore } from '../store/adminAuthStore';
import { authAPI } from '../api/authApi'; // Import hàm gọi API vừa tạo

const { Title, Text } = Typography;

const LoginPage = () => {
    const navigate = useNavigate();
    const setAuth = useAdminAuthStore((state) => state.setAuth);
    const [loading, setLoading] = useState(false);

    // Hàm này tự động chạy khi người dùng điền đúng form và bấm Submit
    const onFinish = async (values) => {
        setLoading(true); // Bật hiệu ứng xoay xoay ở nút Đăng nhập
        try {
            // 1. Gọi API thực tế xuống Backend
            const response = await authAPI.login(values);
            
            // 2. Lấy dữ liệu Backend trả về (Giả sử trả về token, user, permissions)
            const { token, user, permissions } = response.data;

            // 3. Lưu vào Zustand Store & LocalStorage
            setAuth(token, user, permissions);
            
            message.success('Đăng nhập thành công! Chào mừng trở lại.');

            // 4. Chuyển hướng thẳng vào trang Dashboard
            navigate('/admin/dashboard');
        } catch (error) {
            // Nếu lỗi (Sai pass, tài khoản khóa...), hiển thị thông báo lỗi
            const errorMsg = error.response?.data?.message || 'Tài khoản hoặc mật khẩu không đúng!';
            message.error(errorMsg);
        } finally {
            setLoading(false); // Tắt hiệu ứng xoay xoay
        }
    };

    return (
        <div style={{ 
            display: 'flex', justifyContent: 'center', alignItems: 'center', 
            height: '100vh', background: 'linear-gradient(135deg, #1890ff 0%, #8A2BE2 100%)' 
        }}>
            <Card style={{ width: 400, boxShadow: '0 10px 25px rgba(0,0,0,0.2)', borderRadius: '12px' }}>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <Title level={2} style={{ color: '#1890ff', marginBottom: 0 }}>HOTEL ERP</Title>
                    <Text type="secondary">Hệ thống quản trị nội bộ</Text>
                </div>

                <Form name="login_form" layout="vertical" onFinish={onFinish} size="large">
                    {/* Ô nhập Email */}
                    <Form.Item 
                        name="email" 
                        rules={[
                            { required: true, message: 'Vui lòng nhập Email!' },
                            { type: 'email', message: 'Định dạng Email không hợp lệ!' }
                        ]}
                    >
                        <Input prefix={<UserOutlined style={{ color: '#bfbfbf' }}/>} placeholder="Email đăng nhập" />
                    </Form.Item>

                    {/* Ô nhập Mật khẩu */}
                    <Form.Item 
                        name="password" 
                        rules={[{ required: true, message: 'Vui lòng nhập Mật khẩu!' }]}
                    >
                        <Input.Password prefix={<LockOutlined style={{ color: '#bfbfbf' }}/>} placeholder="Mật khẩu" />
                    </Form.Item>

                    {/* Nút Đăng nhập */}
                    <Form.Item style={{ marginTop: '30px', marginBottom: 0 }}>
                        <Button type="primary" htmlType="submit" block loading={loading} style={{ height: '45px', fontSize: '16px' }}>
                            Đăng Nhập
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default LoginPage;