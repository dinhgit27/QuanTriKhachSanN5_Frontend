import React, { useState } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  message,
  Space,
  Tag,
  Popconfirm,
  Avatar
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined
} from '@ant-design/icons';

const { Option } = Select;

const CustomerManagement = () => {
  const [customers, setCustomers] = useState([
    {
      id: 1,
      name: 'Nguyễn Văn A',
      phone: '0123456789',
      email: 'nguyenvana@email.com',
      address: '123 Đường ABC, Quận 1, TP.HCM',
      idCard: '123456789',
      totalBookings: 5,
      status: 'active'
    },
    {
      id: 2,
      name: 'Trần Thị B',
      phone: '0987654321',
      email: 'tranthib@email.com',
      address: '456 Đường XYZ, Quận 2, TP.HCM',
      idCard: '987654321',
      totalBookings: 3,
      status: 'active'
    },
    {
      id: 3,
      name: 'Lê Văn C',
      phone: '0111111111',
      email: 'levanc@email.com',
      address: '789 Đường DEF, Quận 3, TP.HCM',
      idCard: '111222333',
      totalBookings: 1,
      status: 'inactive'
    },
  ]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState(null);
  const [form] = Form.useForm();

  const columns = [
    {
      title: 'Ảnh',
      dataIndex: 'avatar',
      key: 'avatar',
      render: () => <Avatar icon={<UserOutlined />} />,
    },
    {
      title: 'Tên Khách Hàng',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Số Điện Thoại',
      dataIndex: 'phone',
      key: 'phone',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'CMND/CCCD',
      dataIndex: 'idCard',
      key: 'idCard',
    },
    {
      title: 'Tổng Đặt Phòng',
      dataIndex: 'totalBookings',
      key: 'totalBookings',
      sorter: (a, b) => a.totalBookings - b.totalBookings,
      render: (count) => <Tag color="blue">{count} lần</Tag>,
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusMap = {
          active: { color: '#52c41a', text: 'Hoạt Động' },
          inactive: { color: '#f5222d', text: 'Không Hoạt Động' },
        };
        const { color, text } = statusMap[status] || { color: 'default', text: status };
        return <Tag color={color}>{text}</Tag>;
      },
      filters: [
        { text: 'Hoạt Động', value: 'active' },
        { text: 'Không Hoạt Động', value: 'inactive' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Hành Động',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa khách hàng này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Có"
            cancelText="Không"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleAdd = () => {
    setEditingCustomer(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (customer) => {
    setEditingCustomer(customer);
    form.setFieldsValue(customer);
    setIsModalVisible(true);
  };

  const handleDelete = (id) => {
    setCustomers(customers.filter(customer => customer.id !== id));
    message.success('Xóa khách hàng thành công!');
  };

  const handleModalOk = () => {
    form.validateFields().then(values => {
      if (editingCustomer) {
        setCustomers(customers.map(customer =>
          customer.id === editingCustomer.id ? { ...customer, ...values } : customer
        ));
        message.success('Cập nhật khách hàng thành công!');
      } else {
        const newCustomer = {
          ...values,
          id: Math.max(...customers.map(c => c.id)) + 1,
          totalBookings: 0,
        };
        setCustomers([...customers, newCustomer]);
        message.success('Thêm khách hàng thành công!');
      }
      setIsModalVisible(false);
      form.resetFields();
    });
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h1>Quản Lý Khách Hàng</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Thêm Khách Hàng Mới
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={customers}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingCustomer ? 'Sửa Thông Tin Khách Hàng' : 'Thêm Khách Hàng Mới'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="Tên Khách Hàng"
            rules={[{ required: true, message: 'Vui lòng nhập tên khách hàng!' }]}
          >
            <Input placeholder="Nhập tên khách hàng" />
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
            name="idCard"
            label="CMND/CCCD"
            rules={[{ required: true, message: 'Vui lòng nhập CMND/CCCD!' }]}
          >
            <Input placeholder="Nhập số CMND/CCCD" />
          </Form.Item>

          <Form.Item
            name="address"
            label="Địa Chỉ"
            rules={[{ required: true, message: 'Vui lòng nhập địa chỉ!' }]}
          >
            <Input.TextArea rows={2} placeholder="Nhập địa chỉ" />
          </Form.Item>

          <Form.Item
            name="status"
            label="Trạng Thái"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
          >
            <Select placeholder="Chọn trạng thái">
              <Option value="active">Hoạt Động</Option>
              <Option value="inactive">Không Hoạt Động</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CustomerManagement;