import React, { useState, useEffect } from 'react';
import { Table, Modal, Form, Input, Select, Button, Pagination, Row, Col, Tag, Space, Typography, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, UnlockOutlined } from '@ant-design/icons';
import { useLoadingStore } from '../../store/loadingStore';
import { userManagementAPI } from '../../api/userManagement';
import { roleAPI } from '../../api/roleApi';

const { Title } = Typography;
const { Option } = Select;

const UserListPage = () => {
  const setLoading = useLoadingStore((state) => state.setLoading);

  const [users, setUsers] = useState([]); 
  const [filteredUsers, setFilteredUsers] = useState([]); 
  
  const [searchText, setSearchText] = useState('');
  const [filterRole, setFilterRole] = useState(null);
  const [filterStatus, setFilterStatus] = useState(null);
  
  const [total, setTotal] = useState(0);
  const [localLoading, setLocalLoading] = useState(false);
  
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null); // Thêm state để biết đang Sửa hay Thêm mới
  const [form] = Form.useForm();
  const [roles, setRoles] = useState([]);

  const fetchRoles = async () => {
    try {
      const response = await roleAPI.getRoles();
      setRoles(response.data || []);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const fetchUsers = async () => {
    setLocalLoading(true);
    setLoading(true);
    try {
      const response = await userManagementAPI.getUsers();
      const data = response.data.items || response.data.data || response.data || [];
      setUsers(data);
      setFilteredUsers(data); 
      setTotal(data.length);
    } catch (error) {
      message.error('Lỗi khi tải danh sách người dùng!');
    } finally {
      setLocalLoading(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchUsers();
  }, []);

  // Bộ lọc
  useEffect(() => {
    const result = users.filter((user) => {
      const matchSearch = 
        (user.fullName && user.fullName.toLowerCase().includes(searchText.toLowerCase())) ||
        (user.email && user.email.toLowerCase().includes(searchText.toLowerCase()));

      let matchRole = true;
      if (filterRole) {
          const selectedRoleObj = roles.find(r => r.id === filterRole);
          if (selectedRoleObj) matchRole = user.roleName === selectedRoleObj.name;
      }

      let matchStatus = true;
      if (filterStatus !== null && filterStatus !== undefined) {
          const statusBool = filterStatus === "true" || filterStatus === true;
          matchStatus = user.isActive === statusBool;
      }

      return matchSearch && matchRole && matchStatus;
    });

    setFilteredUsers(result);
    setTotal(result.length);
    setPagination(prev => ({ ...prev, current: 1 })); 
  }, [searchText, filterRole, filterStatus, users, roles]);

  const handleTableChange = (pag) => setPagination({ current: pag.current, pageSize: pag.pageSize });

  // Mở Form Thêm Mới
  const handleAddNew = () => {
    setEditingId(null); // Set null tức là Thêm mới
    form.resetFields();
    setModalVisible(true);
  };

  // Mở Form Sửa
  const handleEdit = (user) => {
    setEditingId(user.id); // Lưu lại ID đang sửa
    
    // Tìm ID của chức vụ dựa vào tên (Vì DB đang trả về tên)
    const roleObj = roles.find(r => r.name === user.roleName);

    // Bơm dữ liệu cũ vào Form
    form.setFieldsValue({
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        roleId: roleObj ? roleObj.id : null
    });
    setModalVisible(true);
  };

  // Xử lý Khóa / Mở Khóa tài khoản
  const handleToggleStatus = (user) => {
    Modal.confirm({
      title: 'Xác nhận thay đổi trạng thái',
      content: `Bạn có chắc chắn muốn ${user.isActive ? 'KHÓA' : 'MỞ KHÓA'} tài khoản ${user.email} này?`,
      okText: 'Đồng ý',
      okType: user.isActive ? 'danger' : 'primary',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          setLocalLoading(true);
          await userManagementAPI.toggleStatus(user.id);
          message.success('Cập nhật trạng thái thành công!');
          fetchUsers(); // Tải lại bảng
        } catch (error) {
          message.error('Lỗi: ' + (error.response?.data?.message || error.message));
        } finally {
          setLocalLoading(false);
        }
      }
    });
  };

  // Nút Submit Form (Dùng chung cho cả Thêm và Sửa)
  const handleSubmitForm = async (values) => {
    try {
      setLocalLoading(true);
      if (editingId) {
        // GỌI API SỬA
        await userManagementAPI.updateUser(editingId, values);
        message.success('Cập nhật thông tin thành công!');
      } else {
        // GỌI API THÊM MỚI
        await userManagementAPI.createUser(values);
        message.success('Thêm người dùng thành công!');
      }
      setModalVisible(false);
      fetchUsers(); 
    } catch (error) {
      message.error('Lỗi: ' + (error.response?.data?.message || error.message));
    } finally {
        setLocalLoading(false);
    }
  };

  const columns = [
    { title: '#', key: 'index', render: (_, __, index) => (pagination.current - 1) * pagination.pageSize + index + 1, width: 60 },
    { title: 'Họ tên', dataIndex: 'fullName', key: 'fullName', ellipsis: true },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Điện thoại', dataIndex: 'phoneNumber', key: 'phoneNumber' },
    { title: 'Vai trò', dataIndex: 'roleName', key: 'roleName', render: (roleName) => roleName || 'Chưa có' },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'status',
      render: (isActive) => <Tag color={isActive ? 'green' : 'volcano'}>{isActive ? 'Hoạt động' : 'Đã khóa'}</Tag>,
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 180,
      render: (_, user) => (
        <Space size="small">
          <Button icon={<EditOutlined />} size="small" onClick={() => handleEdit(user)}>Sửa</Button>
          {user.isActive ? (
             <Button danger icon={<DeleteOutlined />} size="small" onClick={() => handleToggleStatus(user)}>Khóa</Button>
          ) : (
             <Button type="primary" ghost icon={<UnlockOutlined />} size="small" onClick={() => handleToggleStatus(user)}>Mở khóa</Button>
          )}
        </Space>
      ),
    },
  ];

  const paginatedData = filteredUsers.slice((pagination.current - 1) * pagination.pageSize, pagination.current * pagination.pageSize);

  return (
    <>
      <Title level={2}>👥 Danh sách Người dùng</Title>
      
      <Row gutter={[16, 16]} style={{ marginBottom: 24, display: 'flex', alignItems: 'center' }}>
        <Col xs={24} sm={12} lg={6}><Input.Search placeholder="Tìm theo tên, email..." allowClear onChange={(e) => setSearchText(e.target.value)} /></Col>
        <Col xs={24} sm={12} lg={5}>
          <Select placeholder="Tất cả vai trò" style={{ width: '100%' }} onChange={(v) => setFilterRole(v)} allowClear>
            {roles.map(role => (<Option key={role.id} value={role.id}>{role.name}</Option>))}
          </Select>
        </Col>
        <Col xs={24} sm={12} lg={5}>
          <Select placeholder="Tất cả trạng thái" style={{ width: '100%' }} onChange={(v) => setFilterStatus(v)} allowClear>
            <Option value="true">Hoạt động</Option>
            <Option value="false">Đã khóa</Option>
          </Select>
        </Col>
        <Col xs={24} sm={12} lg={8} style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddNew}>Thêm mới</Button>
        </Col>
      </Row>

      <Table columns={columns} dataSource={paginatedData} loading={localLoading} pagination={false} rowKey="id" scroll={{ x: 'max-content' }} size="middle" />

      {total > 0 && (
        <Row justify="end" style={{ marginTop: 16 }}>
          <Pagination current={pagination.current} pageSize={pagination.pageSize} total={total} showSizeChanger showQuickJumper onChange={(current, pageSize) => handleTableChange({ current, pageSize })} />
        </Row>
      )}

      {/* Modal dùng chung cho cả Thêm và Sửa */}
      <Modal title={editingId ? "Cập nhật Người dùng" : "Thêm Người dùng mới"} open={modalVisible} onCancel={() => setModalVisible(false)} footer={null} width={600} destroyOnClose>
        <Form form={form} layout="vertical" onFinish={handleSubmitForm}>
          <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}><Input placeholder="Nguyễn Văn A" /></Form.Item>
          <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Vui lòng nhập email!' }, { type: 'email', message: 'Email không đúng định dạng!' }]}><Input placeholder="example@domain.com" disabled={!!editingId} /></Form.Item>
          <Form.Item name="phoneNumber" label="Số điện thoại"><Input placeholder="0123456789" /></Form.Item>
          
          {/* Ẩn nhập mật khẩu nếu đang Sửa */}
          {!editingId && (
              <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, min: 6, message: 'Mật khẩu ít nhất 6 ký tự!' }]}><Input.Password placeholder="Nhập mật khẩu" /></Form.Item>
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
                {editingId ? "Cập nhật" : "Tạo tài khoản"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default UserListPage;