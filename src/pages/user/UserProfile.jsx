import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Avatar,
  message,
  Row,
  Col,
  Divider,
  DatePicker
} from 'antd';
import {
  UserOutlined,
  SaveOutlined,
  EditOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const UserProfile = () => {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();

  // Mock user data
  const userData = {
    name: 'Nguyễn Văn User',
    email: 'user@example.com',
    phone: '0123456789',
    address: '456 Đường XYZ, Quận 2, TP.HCM',
    dateOfBirth: '1990-01-01',
    idCard: '123456789012',
    nationality: 'Việt Nam',
  };

  const handleEdit = () => {
    setEditing(true);
    form.setFieldsValue({
      ...userData,
      dateOfBirth: dayjs(userData.dateOfBirth)
    });
  };

  const handleCancel = () => {
    setEditing(false);
    form.resetFields();
  };

  const handleSave = async (values) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      const updatedData = {
        ...values,
        dateOfBirth: values.dateOfBirth.format('YYYY-MM-DD'),
      };

      console.log('Updated user data:', updatedData);
      message.success('Cập nhật thông tin thành công!');
      setEditing(false);
    } catch (error) {
      message.error('Cập nhật thông tin thất bại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Thông Tin Cá Nhân</h1>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={8}>
          <Card style={{ textAlign: 'center' }}>
            <Avatar
              size={120}
              icon={<UserOutlined />}
              style={{ backgroundColor: '#52c41a', marginBottom: '16px' }}
            />
            <h3>{userData.name}</h3>
            <p>{userData.email}</p>
            {!editing && (
              <Button
                type="primary"
                icon={<EditOutlined />}
                onClick={handleEdit}
                style={{ marginTop: '16px' }}
              >
                Chỉnh Sửa
              </Button>
            )}
          </Card>
        </Col>

        <Col xs={24} md={16}>
          <Card title="Thông Tin Chi Tiết" bordered={false}>
            {editing ? (
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSave}
              >
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="name"
                      label="Họ và Tên"
                      rules={[{ required: true, message: 'Vui lòng nhập họ và tên!' }]}
                    >
                      <Input placeholder="Nhập họ và tên" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="email"
                      label="Email"
                      rules={[
                        { required: true, message: 'Vui lòng nhập email!' },
                        { type: 'email', message: 'Email không hợp lệ!' }
                      ]}
                    >
                      <Input placeholder="Nhập email" />
                    </Form.Item>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="phone"
                      label="Số Điện Thoại"
                      rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
                    >
                      <Input placeholder="Nhập số điện thoại" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="dateOfBirth"
                      label="Ngày Sinh"
                      rules={[{ required: true, message: 'Vui lòng chọn ngày sinh!' }]}
                    >
                      <DatePicker
                        style={{ width: '100%' }}
                        placeholder="Chọn ngày sinh"
                        format="DD/MM/YYYY"
                      />
                    </Form.Item>
                  </Col>
                </Row>

                <Form.Item
                  name="address"
                  label="Địa Chỉ"
                  rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
                >
                  <Input.TextArea rows={2} placeholder="Nhập địa chỉ" />
                </Form.Item>

                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="idCard"
                      label="CMND/CCCD"
                      rules={[{ required: true, message: 'Vui lòng nhập CMND/CCCD!' }]}
                    >
                      <Input placeholder="Nhập số CMND/CCCD" />
                    </Form.Item>
                  </Col>
                  <Col xs={24} md={12}>
                    <Form.Item
                      name="nationality"
                      label="Quốc Tịch"
                    >
                      <Input placeholder="Nhập quốc tịch" />
                    </Form.Item>
                  </Col>
                </Row>

                <Divider />

                <Form.Item>
                  <Space>
                    <Button
                      type="primary"
                      htmlType="submit"
                      icon={<SaveOutlined />}
                      loading={loading}
                    >
                      Lưu Thay Đổi
                    </Button>
                    <Button onClick={handleCancel}>
                      Hủy
                    </Button>
                  </Space>
                </Form.Item>
              </Form>
            ) : (
              <div>
                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <p><strong>Họ và Tên:</strong> {userData.name}</p>
                  </Col>
                  <Col xs={24} md={12}>
                    <p><strong>Email:</strong> {userData.email}</p>
                  </Col>
                </Row>

                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <p><strong>Số Điện Thoại:</strong> {userData.phone}</p>
                  </Col>
                  <Col xs={24} md={12}>
                    <p><strong>Ngày Sinh:</strong> {dayjs(userData.dateOfBirth).format('DD/MM/YYYY')}</p>
                  </Col>
                </Row>

                <p><strong>Địa Chỉ:</strong> {userData.address}</p>

                <Row gutter={16}>
                  <Col xs={24} md={12}>
                    <p><strong>CMND/CCCD:</strong> {userData.idCard}</p>
                  </Col>
                  <Col xs={24} md={12}>
                    <p><strong>Quốc Tịch:</strong> {userData.nationality}</p>
                  </Col>
                </Row>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      <Divider />

      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <Card title="Thống Kê" bordered={false}>
            <Row gutter={16}>
              <Col span={12}>
                <div style={{ textAlign: 'center' }}>
                  <h2 style={{ color: '#1890ff' }}>12</h2>
                  <p>Tổng Đặt Phòng</p>
                </div>
              </Col>
              <Col span={12}>
                <div style={{ textAlign: 'center' }}>
                  <h2 style={{ color: '#52c41a' }}>8</h2>
                  <p>Đặt Phòng Thành Công</p>
                </div>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col xs={24} md={12}>
          <Card title="Điểm Thưởng" bordered={false}>
            <div style={{ textAlign: 'center' }}>
              <h2 style={{ color: '#faad14' }}>2,500</h2>
              <p>Điểm Tích Lũy</p>
              <p style={{ fontSize: '14px', color: '#666' }}>
                Có thể đổi 1 điểm = 1,000 VNĐ
              </p>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default UserProfile;