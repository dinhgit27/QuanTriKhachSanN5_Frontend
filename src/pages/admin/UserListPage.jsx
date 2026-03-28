
import React, { useState, useEffect } from 'react';
import { Table, Modal, Form, Input, Select, Button, Row, Col, Tag, Space, Typography, message } from 'antd';
import { PlusOutlined, EditOutlined, LockOutlined, UnlockOutlined } from '@ant-design/icons';
import { useLoadingStore } from '../../store/loadingStore';
import { userManagementAPI } from '../../api/userManagement';
import { roleAPI } from '../../api/roleApi';
import { useAdminAuthStore } from '../../store/adminAuthStore'; 

const { Title } = Typography;
const { Option } = Select;

const UserListPage = () => {
  const setLoading = useLoadingStore((state) => state.setLoading);
  
  // Lấy thông tin quyền Admin từ Zustand Store
  const user = useAdminAuthStore((state) => state.user);
  const isAdmin = user?.roleName === 'Admin';

  const [users, setUsers] = useState([]); 
  const [filteredUsers, setFilteredUsers] = useState([]); 
  const [localLoading, setLocalLoading] = useState(false);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    fetchUsers();
    fetchRoles();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await userManagementAPI.getUsers();
      setUsers(res.data);
      setFilteredUsers(res.data);
    } catch (error) {
      message.error('Lỗi khi lấy danh sách người dùng!');
    } finally {
      setLoading(false);
    }
  };

  const fetchRoles = async () => {
    try {
      const res = await roleAPI.getRoles();
      setRoles(res.data);
    } catch (error) {
      message.error('Lỗi khi lấy danh sách vai trò!');
    }
  };

  // Hàm xử lý Khoá / Mở khoá tài khoản
  const handleToggleLock = (userId, currentStatus) => {
    Modal.confirm({
      title: 'Xác nhận thay đổi trạng thái',
      content: `Bạn có chắc chắn muốn ${currentStatus ? 'KHOÁ' : 'MỞ KHOÁ'} tài khoản này?`,
      okText: 'Đồng ý',
      okType: currentStatus ? 'danger' : 'primary',
      cancelText: 'Hủy',
      onOk: async () => {
        setLocalLoading(true);
        try {
          const res = await userManagementAPI.toggleStatus(userId);
          message.success(res.data?.message || 'Cập nhật trạng thái thành công!');
          
          // Cập nhật giao diện lập tức không cần tải lại trang
          setUsers(prevUsers => prevUsers.map(u => 
            u.id === userId ? { ...u, isActive: !currentStatus } : u
          ));
          setFilteredUsers(prevFiltered => prevFiltered.map(u => 
            u.id === userId ? { ...u, isActive: !currentStatus } : u
          ));
          
        } catch (error) {
          message.error('Lỗi khi cập nhật trạng thái!');
        } finally {
          setLocalLoading(false);
        }
      }
    });
  };

  const handleSubmit = async (values) => {
    setLocalLoading(true);
    try {
      if (editingId) {
        await userManagementAPI.updateUser(editingId, values);
        message.success('Cập nhật người dùng thành công!');
      } else {
        await userManagementAPI.createUser(values);
        message.success('Thêm người dùng thành công!');
      }
      setModalVisible(false);
      fetchUsers();
    } catch (error) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra!');
    } finally {
      setLocalLoading(false);
    }
  };

  const columns = [
    { title: 'Họ và Tên', dataIndex: 'fullName', key: 'fullName' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { 
      title: 'Vai trò', 
      dataIndex: 'roleName', 
      key: 'roleName',
      render: (text) => <Tag color="blue">{text}</Tag>
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'isActive',
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Hoạt động' : 'Đã khoá'}
        </Tag>
      ),
    },
    {
      title: 'Hành động',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            onClick={() => {
              setEditingId(record.id);
              form.setFieldsValue(record);
              setModalVisible(true);
            }}
          >
            Sửa
          </Button>

          {/* Nút Khoá chỉ hiển thị với Admin */}
          {isAdmin && (
            <Button
              danger={record.isActive} 
              type={record.isActive ? 'default' : 'primary'} 
              icon={record.isActive ? <LockOutlined /> : <UnlockOutlined />}
              onClick={() => handleToggleLock(record.id, record.isActive)}
            >
              {record.isActive ? 'Khoá' : 'Mở khoá'}
            </Button>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, background: '#fff', borderRadius: 8 }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={3}>Quản lý Người dùng</Title>
        </Col>
        <Col>
          {isAdmin && (
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={() => {
                setEditingId(null);
                form.resetFields();
                setModalVisible(true);
              }}
            >
              Thêm Người Dùng
            </Button>
          )}
        </Col>
      </Row>

      <Table 
        columns={columns} 
        dataSource={filteredUsers} 
        rowKey="id" 
        loading={localLoading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingId ? "Sửa thông tin người dùng" : "Thêm người dùng mới"}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item name="fullName" label="Họ và Tên" rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}>
            <Input placeholder="Nguyễn Văn A" />
          </Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Vui lòng nhập email!' }, { type: 'email', message: 'Email không đúng định dạng!' }]}>
            <Input placeholder="example@domain.com" disabled={!!editingId} />
          </Form.Item>
          <Form.Item name="phoneNumber" label="Số điện thoại">
            <Input placeholder="0123456789" />
          </Form.Item>
          
          {!editingId && (
            <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, min: 6, message: 'Mật khẩu ít nhất 6 ký tự!' }]}>
              <Input.Password placeholder="Nhập mật khẩu" />
            </Form.Item>
          )}
          
          <Form.Item name="roleId" label="Vai trò" rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}>
            <Select placeholder="Chọn vai trò">
              {roles.map(role => (<Option key={role.id} value={role.id}>{role.name}</Option>))}
            </Select>
          </Form.Item>
          
          <Form.Item>
            <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button onClick={() => setModalVisible(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={localLoading}>
                {editingId ? "Cập nhật" : "Thêm mới"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserListPage;