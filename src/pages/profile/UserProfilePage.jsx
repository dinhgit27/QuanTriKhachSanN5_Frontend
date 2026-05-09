import React, { useState, useEffect } from 'react';
import { Card, Avatar, Button, Upload, message, Typography } from 'antd';
import { UserOutlined, UploadOutlined } from '@ant-design/icons';
import axiosClient from '../../api/axios';
import { useAdminAuthStore } from '../../store/adminAuthStore';

const { Title, Text } = Typography;

const UserProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const user = useAdminAuthStore(state => state.user);

  useEffect(() => {
    const fetchMyProfile = async () => {
      try {
        // Thiết kế an toàn (chống IDOR): Không gửi tham số ID trên URL [cite: 328, 329]
        const res = await axiosClient.get('/UserProfile/my-profile');
        setProfile(res.data);
      } catch (error) {
        message.error('Lỗi khi tải thông tin hồ sơ');
      }
    };
    fetchMyProfile();
  }, []);

  // Code upload Avatar thực tế với FormData [cite: 331-354]
  const handleUploadAvatar = async ({ file }) => {
    setUploading(true);
    const formData = new FormData();
    formData.append('avatar', file); // Gửi file qua FormData [cite: 332, 336]

    try {
      const res = await axiosClient.post('/UserProfile/upload-avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data' // Bắt buộc khi dùng FormData [cite: 351]
        }
      });
      
      // Cập nhật giao diện với URL mới trả về từ CDN (như Cloudinary) [cite: 345, 347, 353, 354]
      setProfile(prev => ({ ...prev, avatarUrl: res.data.avatarUrl }));
      message.success('Cập nhật ảnh đại diện thành công');
    } catch (error) {
      message.error('Upload thất bại');
    } finally {
      setUploading(false);
    }
  };

  if (!profile) return <div>Đang tải...</div>;

  return (
    <Card style={{ maxWidth: 600, margin: '20px auto' }}>
      <div style={{ textAlign: 'center', marginBottom: 20 }}>
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
      
      <div>
        <Title level={4}>{profile.fullName || user?.name}</Title>
        <Text type="secondary">{profile.email || user?.email}</Text>
        <p style={{ marginTop: 16 }}>
          <strong>Vai trò:</strong> <Tag color="geekblue">{profile.roleName || 'Nhân viên'}</Tag>
        </p>
      </div>
    </Card>
  );
};

export default UserProfilePage;