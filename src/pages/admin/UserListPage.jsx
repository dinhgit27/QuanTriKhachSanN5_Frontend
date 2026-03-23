import React, { useState, useEffect } from 'react';
import { Table, Modal, Form, Input, Select, Button, Pagination, Row, Col, Tag, Space, Typography, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { useLoadingStore } from '../../store/loadingStore';
import { userManagementAPI } from '../../api/userManagement';
import { roleAPI } from '../../api/roleApi';

const { Title } = Typography;
const { Option } = Select;

const UserListPage = () => {
  const setLoading = useLoadingStore((state) => state.setLoading);

  // States
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [localLoading, setLocalLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    roleId: '',
    status: '',
  });
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [roles, setRoles] = useState([]);

  // Fetch users with filters/pagination
  const fetchUsers = async () => {
    setLocalLoading(true);
    setLoading(true);
    try {
      const params = {
        pageIndex: pagination.current - 1, // Backend thường 0-based
        pageSize: pagination.pageSize,
        searchTerm: filters.search || undefined,
        roleId: filters.roleId || undefined,
        status: filters.status || undefined,
      };
      const response = await userManagementAPI.getUsers(params);
      setUsers(response.data.items || response.data.data || response.data || []);
      setTotal(response.data.totalCount || response.data.totalRecords || 0);
    } catch (error) {
      console.error(error);
      message.error('Lỗi khi tải danh sách người dùng!');
    } finally {
      setLocalLoading(false);
      setLoading(false);
    }
  };

  // Fetch roles for filter and form
  const fetchRoles = async () => {
    try {
      const response = await roleAPI.getRoles?.() || roleAPI.getAllRoles?.();
      setRoles(response.data || []);
    } catch (error) {
      console.error('Error fetching roles:', error);
      message.warning('Không tải được danh sách vai trò');
    }
  };

  useEffect(() => {
    fetchRoles();
    fetchUsers();
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [filters, pagination]);

  const handleTableChange = (pag) => {
    setPagination({
      current: pag.current,
      pageSize: pag.pageSize,
    });
  };

  const handleSearch = (value) => {
    setFilters({ ...filters, search: value });
    setPagination({ ...pagination, current: 1 });
  };

  const handleFilter = (key, value) => {
    setFilters({ ...filters, [key]: value });
    setPagination({ ...pagination, current: 1 });
  };

  const handleAddNew = () => {
    setModalVisible(true);
    form.resetFields();
  };

  const handleCreate = async (values) => {
    try {
      await userManagementAPI.createUser(values);
      message.success('Thêm người dùng thành công!');
      setModalVisible(false);
      fetchUsers(); // Refresh list
    } catch (error) {
      message.error('Lỗi tạo người dùng: ' + (error.response?.data?.message || error.message));
    }
  };

  const columns = [
    {
      title: '#',
      key: 'index',
      render: (_, __, index) => (pagination.current - 1) * pagination.pageSize + index + 1,
      width: 60,
    },
    {
      title: 'Họ tên',
      dataIndex: 'fullName',
      key: 'fullName',
      ellipsis: true,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Điện thoại',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
    },
    {
      title: 'Vai trò',
      dataIndex: 'roleName',
      key: 'roleName',
      render: (roleName) => roleName || 'Chưa có',
    },
    {
      title: 'Trạng thái',
      dataIndex: 'isActive',
      key: 'status',
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'volcano'}>
          {isActive ? 'Hoạt động' : 'Đã khóa'}
        </Tag>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 150,
      render: (_, user) => (
        <Space size="small">
          <Button 
            icon={<EditOutlined />} 
            size="small"
            onClick={() => {/* TODO: Edit modal */}}
          >
            Sửa
          </Button>
          <Button 
            danger 
            icon={<DeleteOutlined />} 
            size="small"
            onClick={() => {/* TODO: Confirm delete */}}
          >
            Khóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <Title level={2}>👥 Danh sách Người dùng</Title>
      
      {/* Filters */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Input.Search
            placeholder="Tìm theo tên, email..."
            enterButton="Tìm"
            onSearch={handleSearch}
            allowClear
          />
        </Col>
        <Col xs={24} sm={12} lg={5}>
          <Select
            placeholder="Tất cả vai trò"
            style={{ width: '100%' }}
            onChange={(v) => handleFilter('roleId', v)}
            allowClear
          >
            {roles.map(role => (
              <Option key={role.id} value={role.id}>{role.name}</Option>
            ))}
          </Select>
        </Col>
        <Col xs={24} sm={12} lg={5}>
          <Select
            placeholder="Tất cả trạng thái"
            style={{ width: '100%' }}
            onChange={(v) => handleFilter('status', v)}
            allowClear
          >
            <Option value="true">Hoạt động</Option>
            <Option value="false">Đã khóa</Option>
          </Select>
        </Col>
        <Col xs={24} sm={12} lg={4}>
          <Button 
            type="primary" 
            icon={<PlusOutlined />}
            onClick={handleAddNew}
            block
          >
            Thêm mới
          </Button>
        </Col>
      </Row>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={users}
        loading={localLoading}
        pagination={false}
        rowKey="id"
        scroll={{ x: 'max-content' }}
        size="middle"
      />

      {/* Pagination */}
      {total > 0 && (
        <Row justify="end" style={{ marginTop: 16 }}>
          <Pagination
            {...pagination}
            total={total}
            showSizeChanger
            showQuickJumper
            showTotal={(total, range) => 
              `${range[0]}-${range[1]} của ${total} người dùng`
            }
            onChange={handleTableChange}
          />
        </Row>
      )}

      {/* Add Modal */}
      <Modal
        title="Thêm Người dùng mới"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleCreate}>
          <Form.Item 
            name="fullName" 
            label="Họ và tên"
            rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
          >
            <Input placeholder="Nguyễn Văn A" />
          </Form.Item>
          
          <Form.Item 
            name="email" 
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không đúng định dạng!' }
            ]}
          >
            <Input placeholder="example@domain.com" />
          </Form.Item>
          
          <Form.Item 
            name="phoneNumber" 
            label="Số điện thoại"
          >
            <Input placeholder="0123456789" />
          </Form.Item>
          
          <Form.Item 
            name="password" 
            label="Mật khẩu"
            rules={[{ required: true, min: 6, message: 'Mật khẩu ít nhất 6 ký tự!' }]}
          >
            <Input.Password placeholder="Nhập mật khẩu" />
          </Form.Item>
          
          <Form.Item 
            name="roleId"
            label="Vai trò"
            rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}
          >
            <Select placeholder="Chọn vai trò">
              {roles.map(role => (
                <Option key={role.id} value={role.id}>{role.name}</Option>
              ))}
            </Select>
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button onClick={() => setModalVisible(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit" loading={localLoading}>
                Tạo tài khoản
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default UserListPage;

