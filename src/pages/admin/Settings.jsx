import React, { useState } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Switch,
  message,
  Tabs,
  InputNumber,
  Select,
  Divider
} from 'antd';
import { SaveOutlined } from '@ant-design/icons';

const { TabPane } = Tabs;
const { Option } = Select;

const Settings = () => {
  const [loading, setLoading] = useState(false);
  const [generalForm] = Form.useForm();
  const [systemForm] = Form.useForm();

  const handleGeneralSave = async (values) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      message.success('Cài đặt chung đã được lưu!');
    } catch (error) {
      message.error('Lưu cài đặt thất bại!');
    } finally {
      setLoading(false);
    }
  };

  const handleSystemSave = async (values) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      message.success('Cài đặt hệ thống đã được lưu!');
    } catch (error) {
      message.error('Lưu cài đặt thất bại!');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1>Cài Đặt</h1>

      <Tabs defaultActiveKey="general" type="card">
        <TabPane tab="Cài Đặt Chung" key="general">
          <Card title="Thông Tin Khách Sạn" bordered={false}>
            <Form
              form={generalForm}
              layout="vertical"
              onFinish={handleGeneralSave}
              initialValues={{
                hotelName: 'Khách Sạn ABC',
                address: '123 Đường ABC, Quận 1, TP.HCM',
                phone: '0123 456 789',
                email: 'info@hotelabc.com',
                website: 'www.hotelabc.com',
                checkInTime: '14:00',
                checkOutTime: '12:00',
              }}
            >
              <Form.Item
                name="hotelName"
                label="Tên Khách Sạn"
                rules={[{ required: true, message: 'Vui lòng nhập tên khách sạn!' }]}
              >
                <Input placeholder="Nhập tên khách sạn" />
              </Form.Item>

              <Form.Item
                name="address"
                label="Địa Chỉ"
                rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
              >
                <Input.TextArea rows={2} placeholder="Nhập địa chỉ" />
              </Form.Item>

              <Form.Item
                name="phone"
                label="Số Điện Thoại"
                rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
              >
                <Input placeholder="Nhập số điện thoại" />
              </Form.Item>

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

              <Form.Item
                name="website"
                label="Website"
              >
                <Input placeholder="Nhập website" />
              </Form.Item>

              <Divider />

              <Form.Item
                name="checkInTime"
                label="Giờ Check-in"
                rules={[{ required: true, message: 'Vui lòng nhập giờ check-in!' }]}
              >
                <Input placeholder="Ví dụ: 14:00" />
              </Form.Item>

              <Form.Item
                name="checkOutTime"
                label="Giờ Check-out"
                rules={[{ required: true, message: 'Vui lòng nhập giờ check-out!' }]}
              >
                <Input placeholder="Ví dụ: 12:00" />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={loading}
                >
                  Lưu Cài Đặt
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>

        <TabPane tab="Cài Đặt Hệ Thống" key="system">
          <Card title="Cấu Hình Hệ Thống" bordered={false}>
            <Form
              form={systemForm}
              layout="vertical"
              onFinish={handleSystemSave}
              initialValues={{
                autoBackup: true,
                emailNotifications: true,
                smsNotifications: false,
                currency: 'VND',
                language: 'vi',
                timezone: 'Asia/Ho_Chi_Minh',
                maxBookingsPerDay: 50,
                maintenanceMode: false,
              }}
            >
              <Form.Item
                name="autoBackup"
                label="Sao Lưu Tự Động"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              <Form.Item
                name="emailNotifications"
                label="Thông Báo Email"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              <Form.Item
                name="smsNotifications"
                label="Thông Báo SMS"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              <Divider />

              <Form.Item
                name="currency"
                label="Tiền Tệ"
              >
                <Select>
                  <Option value="VND">VNĐ</Option>
                  <Option value="USD">USD</Option>
                  <Option value="EUR">EUR</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="language"
                label="Ngôn Ngữ"
              >
                <Select>
                  <Option value="vi">Tiếng Việt</Option>
                  <Option value="en">English</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="timezone"
                label="Múi Giờ"
              >
                <Select>
                  <Option value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh</Option>
                  <Option value="Asia/Hanoi">Asia/Hanoi</Option>
                  <Option value="UTC">UTC</Option>
                </Select>
              </Form.Item>

              <Divider />

              <Form.Item
                name="maxBookingsPerDay"
                label="Số Đặt Phòng Tối Đa/Ngày"
              >
                <InputNumber min={1} max={1000} />
              </Form.Item>

              <Form.Item
                name="maintenanceMode"
                label="Chế Độ Bảo Trì"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              <Form.Item>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SaveOutlined />}
                  loading={loading}
                >
                  Lưu Cài Đặt
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>

        <TabPane tab="Bảo Mật" key="security">
          <Card title="Cài Đặt Bảo Mật" bordered={false}>
            <Form layout="vertical">
              <Form.Item
                label="Mật Khẩu Hiện Tại"
                name="currentPassword"
                rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại!' }]}
              >
                <Input.Password placeholder="Nhập mật khẩu hiện tại" />
              </Form.Item>

              <Form.Item
                label="Mật Khẩu Mới"
                name="newPassword"
                rules={[
                  { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
                  { min: 8, message: 'Mật khẩu phải có ít nhất 8 ký tự!' }
                ]}
              >
                <Input.Password placeholder="Nhập mật khẩu mới" />
              </Form.Item>

              <Form.Item
                label="Xác Nhận Mật Khẩu Mới"
                name="confirmPassword"
                dependencies={['newPassword']}
                rules={[
                  { required: true, message: 'Vui lòng xác nhận mật khẩu!' },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      if (!value || getFieldValue('newPassword') === value) {
                        return Promise.resolve();
                      }
                      return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                    },
                  }),
                ]}
              >
                <Input.Password placeholder="Xác nhận mật khẩu mới" />
              </Form.Item>

              <Form.Item
                name="twoFactorAuth"
                label="Xác Thực Hai Yếu Tố"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>

              <Form.Item>
                <Button type="primary" icon={<SaveOutlined />}>
                  Cập Nhật Bảo Mật
                </Button>
              </Form.Item>
            </Form>
          </Card>
        </TabPane>
      </Tabs>
    </div>
  );
};

export default Settings;