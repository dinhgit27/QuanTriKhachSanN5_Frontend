import React, { useState, useEffect, useCallback } from 'react';
import { Table, Tag, Space, Button, message, Modal } from 'antd';
import axiosClient from "../../api/axios";

const UserListPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Dùng useCallback để tránh render lại hàm không cần thiết [cite: 702-712]
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Gọi nhiều API song song bằng Promise.all [cite: 284, 285, 291-294]
      const [usersRes, rolesRes] = await Promise.all([
        axiosClient.get('/UserManagement'),
        axiosClient.get('/Roles')
      ]);
      setUsers(usersRes.data);
    } catch (error) {
      message.error('Không thể tải dữ liệu');
    } finally {
      setLoading(false);
    }
  }, []);

  // Gọi fetch data trong useEffect [cite: 693-701]
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleLock = async (id) => {
    try {
      // Thực hiện Soft Delete để khóa tài khoản [cite: 282, 308, 309]
      await axiosClient.delete(`/UserManagement/${id}`);
      message.success('Đã khóa tài khoản');
      fetchData(); // Refresh list
    } catch (error) {
      message.error('Lỗi khi khóa tài khoản');
    }
  };

  const handleChangeRole = (record) => {
    // Logic mở Modal đổi vai trò sẽ được implement ở đây [cite: 276, 277]
    message.info(`Mở chức năng đổi vai trò cho ${record.fullName}`);
  };

  // Cấu trúc cột dựa theo tài liệu [cite: 641-669]
  const columns = [
    { title: 'Họ tên', dataIndex: 'fullName', key: 'fullName' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { 
      title: 'Vai trò', 
      dataIndex: 'roleName', 
      key: 'roleName',
      render: (role) => <Tag color="blue">{role}</Tag> 
    },
    { 
      title: 'Trạng thái', 
      dataIndex: 'isActive', 
      key: 'isActive',
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Hoạt động' : 'Đã khóa'}
        </Tag>
      )
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button onClick={() => handleChangeRole(record)}>Đổi vai trò</Button>
          <Button danger onClick={() => handleLock(record.id)}>Khóa</Button>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: 24, background: '#fff', minHeight: 360 }}>
      <h2>Quản lý Người dùng</h2>
      <Button type="primary" style={{ marginBottom: 16 }} onClick={() => message.info('Mở Modal Thêm Mới')}>
        Thêm tài khoản
      </Button>
      <Table 
        columns={columns} 
        dataSource={users} 
        rowKey="id" 
        loading={loading}
      />
    </div>
  );
};

export default UserListPage;