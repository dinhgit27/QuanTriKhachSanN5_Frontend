import React, { useState, useEffect } from 'react';
import { Card, Avatar, Button, Upload, message, Typography, Form, Input, Space, Tag, Layout, Breadcrumb } from 'antd';
import { UserOutlined, UploadOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';
import axiosClient from '../../api/axios';
import { useAdminAuthStore } from '../../store/adminAuthStore';

const { Title, Text } = Typography;
const { Content } = Layout;

export const UserProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const user = useAdminAuthStore(state => state.user);
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchMyProfile = async () => {
      try {
        const res = await axiosClient.get('/UserProfile/my-profile');
        setProfile(res.data);
      } catch (error) {
        message.error('Lỗi khi tải thông tin hồ sơ');
      }
    };
    fetchMyProfile();
  }, []);

  useEffect(() => {
    if (profile) {
      form.setFieldsValue({
        fullName: profile.fullName,
        phoneNumber: profile.phoneNumber || '',
        email: profile.email || user?.email || '',
      });
    }
  }, [profile, form, user]);

  const handleSaveProfile = async (values) => {
    setSaving(true);
    const updatedProfile = {
      ...profile,
      fullName: values.fullName,
      phoneNumber: values.phoneNumber,
    };

    try {
      await axiosClient.put('/UserProfile/update', {
        fullName: values.fullName,
        phoneNumber: values.phoneNumber,
      });
      setProfile(updatedProfile);
      const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
      localStorage.setItem('user', JSON.stringify({ ...storedUser, fullName: values.fullName, phoneNumber: values.phoneNumber }));
      localStorage.setItem('userName', values.fullName);
      message.success('Cập nhật thông tin cá nhân thành công');
    } catch (error) {
      if (error.response?.status === 404 || error.response?.status === 405) {
        setProfile(updatedProfile);
        const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
        localStorage.setItem('user', JSON.stringify({ ...storedUser, fullName: values.fullName, phoneNumber: values.phoneNumber }));
        localStorage.setItem('userName', values.fullName);
        message.success('Cập nhật thông tin cá nhân thành công (lưu cục bộ)');
      } else {
        message.error('Cập nhật thông tin thất bại');
      }
    } finally {
      setSaving(false);
    }
  };

  const handleUploadAvatar = async ({ file }) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      const res = await axiosClient.post('/UserProfile/upload-avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setProfile((prev) => ({ ...prev, avatarUrl: res.data.avatarUrl }));
      message.success('Cập nhật ảnh đại diện thành công');
    } catch (error) {
      message.error('Upload thất bại');
    } finally {
      setUploading(false);
    }
  };

  if (!profile) return <div>Đang tải...</div>;

  return (
    <Layout style={{ minHeight: '100vh', background: '#f4f5f7' }}>
      <Content style={{ padding: '40px 50px' }}>
        <Breadcrumb separator=">" style={{ marginBottom: 24 }}>
          <Breadcrumb.Item>
            <Link to="/guest/dashboard">Dashboard</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Cài đặt tài khoản</Breadcrumb.Item>
        </Breadcrumb>

        <Card style={{ maxWidth: 700, margin: '0 auto', borderRadius: 18, boxShadow: '0 8px 24px rgba(0,0,0,0.08)' }}>
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <Avatar
              size={120}
              src={profile.avatarUrl}
              icon={<UserOutlined />}
              style={{ marginBottom: 16 }}
            />
            <br />
            <Upload customRequest={handleUploadAvatar} showUploadList={false}>
              <Button icon={<UploadOutlined />} loading={uploading}>
                Đổi ảnh đại diện
              </Button>
            </Upload>
          </div>

          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <Title level={4} style={{ marginBottom: 0 }}>{profile.fullName || user?.name}</Title>
                <Text type="secondary">{profile.email || user?.email}</Text>
              </div>
              <Tag color="gold" style={{ fontSize: 14, padding: '6px 14px', borderRadius: 20 }}>
                {profile.rank || localStorage.getItem(`userRank_${profile.email || user?.email || localStorage.getItem('userEmail') || 'guest@hotel.com'}`) || 'Khách Mới'}
              </Tag>
            </div>

            <Form form={form} layout="vertical" onFinish={handleSaveProfile}>
              <Form.Item label="Email" name="email">
                <Input disabled />
              </Form.Item>

              <Form.Item
                label="Họ và tên"
                name="fullName"
                rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
              >
                <Input placeholder="Họ và tên" />
              </Form.Item>

              <Form.Item label="Số điện thoại" name="phoneNumber">
                <Input placeholder="Số điện thoại" />
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" loading={saving} size="large" style={{ width: '100%', borderRadius: 8 }}>
                  Lưu thay đổi
                </Button>
              </Form.Item>
            </Form>
          </Space>
        </Card>
      </Content>
    </Layout>
  );
};

export default UserProfilePage;
