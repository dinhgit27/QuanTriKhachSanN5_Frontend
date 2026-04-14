import React, { useState, useEffect } from 'react';
import { 
  Table, Modal, Form, Input, Select, Button, Tag, Space, 
  Typography, message, Card, Popconfirm, Tabs, Row, Col, Checkbox
} from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, 
  UnlockOutlined, SearchOutlined, UserOutlined, SafetyCertificateOutlined 
} from '@ant-design/icons';
import { useLoadingStore } from '../../store/loadingStore';
import { userManagementAPI } from '../../api/userManagement';
import { roleAPI } from '../../api/roleApi';
import { useAuditLog } from '../../hooks/useAuditLog';

const { Title, Text } = Typography;
const { Option } = Select;

const UserListPage = () => {
  const setLoading = useLoadingStore((state) => state.setLoading);
  const { logAction } = useAuditLog();

  const [users, setUsers] = useState([]); 
  const [filteredUsers, setFilteredUsers] = useState([]); 
  const [searchText, setSearchText] = useState('');
  const [filterRole, setFilterRole] = useState(null);
  const [filterStatus, setFilterStatus] = useState(null);
  const [total, setTotal] = useState(0);
  const [localLoading, setLocalLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 8 });
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null); 
  const [form] = Form.useForm();
  const [roles, setRoles] = useState([]);

  // --- ROLE & PERMISSION STATE ---
  const [roleModalVisible, setRoleModalVisible] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [allPermissions, setAllPermissions] = useState([]);
  const [rolePermissions, setRolePermissions] = useState([]);
  // --- FETCH DỮ LIỆU ---
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

  const fetchAllPermissions = async () => {
    try {
      const res = await roleAPI.getPermissions();
      setAllPermissions(res.data || []);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchUsers();
    fetchAllPermissions();
  }, []);

  // --- BỘ LỌC TỔNG HỢP ---
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

  // --- XỬ LÝ FORM ---
  const handleAddNew = () => {
    setEditingId(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (user) => {
    setEditingId(user.id);
    const roleObj = roles.find(r => r.name === user.roleName);
    form.setFieldsValue({
        fullName: user.fullName,
        email: user.email,
        phoneNumber: user.phoneNumber,
        roleId: roleObj ? roleObj.id : null
    });
    setModalVisible(true);
  };

  const handleToggleStatus = (user) => {
    Modal.confirm({
      title: 'Xác nhận thay đổi trạng thái',
      content: `Bạn có chắc chắn muốn ${user.isActive ? 'KHÓA' : 'MỞ KHÓA'} tài khoản ${user.email}?`,
      okText: 'Đồng ý',
      okType: user.isActive ? 'danger' : 'primary',
      cancelText: 'Hủy',
      centered: true,
      onOk: async () => {
        try {
          setLocalLoading(true);
          await userManagementAPI.toggleStatus(user.id);
          
          // Log action
          logAction({
            action: 'Sửa',
            actionType: 'UPDATE',
            module: 'Nhân viên & Quyền',
            objectName: user.fullName,
            description: `${user.isActive ? 'Khóa' : 'Mở khóa'} tài khoản: ${user.email}`,
            oldValue: { status: user.isActive ? 'Active' : 'Locked' },
            newValue: { status: user.isActive ? 'Locked' : 'Active' },
          });
          
          message.success('Cập nhật thành công!');
          fetchUsers();
        } catch (error) {
          message.error('Lỗi: ' + (error.response?.data?.message || error.message));
        } finally {
          setLocalLoading(false);
        }
      }
    });
  };

  const handleSubmitForm = async (values) => {
    try {
      setLocalLoading(true);
      if (editingId) {
        // Update
        await userManagementAPI.updateUser(editingId, values);
        
        // Log action
        logAction({
          action: 'Sửa',
          actionType: 'UPDATE',
          module: 'Nhân viên & Quyền',
          objectName: values.fullName,
          description: `Cập nhật thông tin nhân viên: ${values.email}`,
          newValue: values,
        });
        
        message.success('Cập nhật thông tin thành công!');
      } else {
        // Create
        await userManagementAPI.createUser(values);
        
        // Log action
        logAction({
          action: 'Thêm',
          actionType: 'CREATE',
          module: 'Nhân viên & Quyền',
          objectName: values.fullName,
          description: `Thêm nhân viên mới: ${values.email}`,
          newValue: values,
        });
        
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

  // --- XỬ LÝ PHÂN QUYỀN VAI TRÒ ---
  const handleOpenRoleModal = async (role) => {
    setSelectedRole(role);
    setLocalLoading(true);
    try {
      const res = await roleAPI.getRolePermissions(role.id);
      setRolePermissions(res.data || []);
      setRoleModalVisible(true);
    } catch (error) {
      message.error("Lỗi khi tải quyền của chức vụ này!");
    } finally {
      setLocalLoading(false);
    }
  };

  const handleSaveRolePermissions = async () => {
    try {
      setLocalLoading(true);
      await roleAPI.assignPermissions(selectedRole.id, rolePermissions);
      
      logAction({
          action: 'Sửa',
          actionType: 'UPDATE',
          module: 'Nhân viên & Quyền',
          objectName: selectedRole.name,
          description: `Cập nhật phân quyền cho chức vụ: ${selectedRole.name}`
      });
      message.success("Lưu phân quyền thành công!");
      setRoleModalVisible(false);
    } catch (error) {
      message.error("Lỗi khi lưu quyền!");
    } finally {
      setLocalLoading(false);
    }
  };

  const handleTogglePermission = (permissionId, e) => {
    if (e.target.checked) {
      setRolePermissions([...rolePermissions, permissionId]);
    } else {
      setRolePermissions(rolePermissions.filter(id => id !== permissionId));
    }
  };

  // --- CẤU HÌNH CỘT ---
  const columns = [
    { title: 'Họ tên', dataIndex: 'fullName', key: 'fullName', render: t => <b>{t}</b> },
    { title: 'Email', dataIndex: 'email', key: 'email', ellipsis: true },
    { title: 'Điện thoại', dataIndex: 'phoneNumber', key: 'phoneNumber' },
    { 
      title: 'Vai trò', 
      dataIndex: 'roleName', 
      key: 'roleName', 
      render: (role) => <Tag color="blue">{role || 'N/A'}</Tag> 
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'status',
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'} style={{ borderRadius: 10 }}>
          {isActive ? '● Hoạt động' : '● Đã khóa'}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 200,
      render: (_, user) => (
        <Space size="middle">
          <Button ghost type="primary" icon={<EditOutlined />} size="small" onClick={() => handleEdit(user)}>Sửa</Button>
          {user.isActive ? (
             <Button danger icon={<DeleteOutlined />} size="small" onClick={() => handleToggleStatus(user)}>Khóa</Button>
          ) : (
             <Button type="primary" ghost icon={<UnlockOutlined />} size="small" onClick={() => handleToggleStatus(user)}>Mở khóa</Button>
          )}
        </Space>
      ),
    },
  ];

  const userTabContent = (
    <>
      {/* BỘ LỌC DÀN HÀNG NGANG */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: 24, flexWrap: 'wrap' }}>
        <Input
          placeholder="Tìm theo tên, email..."
          allowClear
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 300 }}
          prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
        />
        
        <Select 
          placeholder="Tất cả vai trò" 
          style={{ width: 200 }} 
          onChange={(v) => setFilterRole(v)} 
          allowClear
        >
          {roles.map(role => (<Option key={role.id} value={role.id}>{role.name}</Option>))}
        </Select>

        <Select 
          placeholder="Tất cả trạng thái" 
          style={{ width: 200 }} 
          onChange={(v) => setFilterStatus(v)} 
          allowClear
        >
          <Option value="true">Hoạt động</Option>
          <Option value="false">Đã khóa</Option>
        </Select>
      </div>

      {/* BẢNG DỮ LIỆU */}
      <Table 
        columns={columns} 
        dataSource={filteredUsers} 
        loading={localLoading} 
        rowKey="id" 
        pagination={{ 
            ...pagination, 
            total: total, 
            showTotal: (t) => `Tổng cộng ${t} nhân viên`,
            onChange: (page, pageSize) => handleTableChange({ current: page, pageSize })
        }} 
        size="middle" 
      />
    </>
  );

  const roleTabContent = (
    <Table 
      columns={[
        { title: 'ID', dataIndex: 'id', key: 'id', width: 100, render: id => `#ROL-${id}` },
        { title: 'TÊN VAI TRÒ', dataIndex: 'name', key: 'name', width: 200, render: (t) => <Space><SafetyCertificateOutlined style={{color: '#1890ff'}}/> <b>{t}</b></Space> },
        { title: 'MÔ TẢ', dataIndex: 'description', key: 'description' },
        { title: 'THAO TÁC', key: 'actions', width: 150, render: (_, record) => <Button type="primary" onClick={() => handleOpenRoleModal(record)}>PHÂN QUYỀN</Button> }
      ]}
      dataSource={roles}
      rowKey="id"
      pagination={false}
      bordered
    />
  );

  const tabItems = [
    { key: 'users', label: 'Danh sách nhân viên', children: userTabContent },
    { key: 'roles', label: 'Vai trò & Phân quyền', children: roleTabContent },
  ];

  return (
    <Card style={{ margin: 24, borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
      {/* PHẦN ĐẦU */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Nhân viên & Phân Quyền</Title>
          <Text type="secondary">Quản lý tài khoản nhân viên và cấu hình phân quyền hệ thống</Text>
        </div>
        <Button type="primary" size="large" icon={<PlusOutlined />} onClick={handleAddNew} style={{ borderRadius: 8 }}>
          Thêm nhân viên
        </Button>
      </div>

      <Tabs items={tabItems} defaultActiveKey="users" />

      {/* MODAL THÊM/SỬA */}
      <Modal 
        title={editingId ? "📝 Cập nhật Người dùng" : "✨ Thêm Người dùng mới"} 
        open={modalVisible} 
        onCancel={() => setModalVisible(false)} 
        footer={null} 
        width={600} 
        centered
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmitForm} style={{ marginTop: 15 }}>
          <Form.Item name="fullName" label="Họ và tên" rules={[{ required: true, message: 'Nhập họ tên đi ní!' }]}>
            <Input prefix={<UserOutlined />} placeholder="Nguyễn Văn A" />
          </Form.Item>
          
          <Form.Item name="email" label="Email" rules={[{ required: true, message: 'Nhập email!' }, { type: 'email', message: 'Sai định dạng rồi!' }]}>
            <Input placeholder="example@domain.com" disabled={!!editingId} />
          </Form.Item>

          <Form.Item name="phoneNumber" label="Số điện thoại">
            <Input placeholder="0123456789" />
          </Form.Item>
          
          {!editingId && (
              <Form.Item name="password" label="Mật khẩu" rules={[{ required: true, min: 6, message: 'Ít nhất 6 ký tự nha!' }]}>
                <Input.Password placeholder="Nhập mật khẩu" />
              </Form.Item>
          )}
          
          <Form.Item name="roleId" label="Vai trò" rules={[{ required: true, message: 'Chọn chức vụ!' }]}>
            <Select placeholder="Chọn vai trò">
              {roles.map(role => (<Option key={role.id} value={role.id}>{role.name}</Option>))}
            </Select>
          </Form.Item>
          
          <Form.Item style={{ marginBottom: 0, marginTop: 24 }}>
            <Space style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button onClick={() => setModalVisible(false)}>Hủy bỏ</Button>
              <Button type="primary" htmlType="submit" loading={localLoading}>
                {editingId ? "Cập nhật ngay" : "Tạo tài khoản"}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* MODAL PHÂN QUYỀN VAI TRÒ */}
      <Modal
        title={`Phân quyền cho: ${selectedRole?.name}`}
        open={roleModalVisible}
        onCancel={() => setRoleModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setRoleModalVisible(false)}>Hủy</Button>,
          <Button key="save" type="primary" onClick={handleSaveRolePermissions} loading={localLoading}>Lưu thay đổi</Button>
        ]}
        width={700}
        centered
        destroyOnClose
      >
        <Text type="secondary" style={{ display: 'block', marginBottom: 24 }}>
          Vui lòng tick chọn các chức năng mà vai trò này được phép truy cập
        </Text>
        <Row gutter={[16, 16]}>
          {allPermissions.map(p => (
             <Col span={8} key={p.id}>
               <Checkbox 
                 checked={rolePermissions.includes(p.id)} 
                 onChange={(e) => handleTogglePermission(p.id, e)}
               >
                 {p.name}
               </Checkbox>
             </Col>
          ))}
        </Row>
      </Modal>
    </Card>
  );
};

export default UserListPage;