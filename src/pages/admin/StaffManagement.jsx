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
  Avatar,
  DatePicker
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Option } = Select;

const StaffManagement = () => {
  const [staff, setStaff] = useState([
    {
      id: 1,
      name: 'Nguyễn Thị D',
      phone: '0123456789',
      email: 'nguyenthid@email.com',
      position: 'Lễ Tân',
      role: 'Nhân Viên',
      salary: 8000000,
      hireDate: '2023-01-15',
      status: 'active'
    },
    {
      id: 2,
      name: 'Trần Văn E',
      phone: '0987654321',
      email: 'tranvane@email.com',
      position: 'Quản Lý',
      role: 'Quản Lý',
      salary: 15000000,
      hireDate: '2022-06-01',
      status: 'active'
    },
    {
      id: 3,
      name: 'Lê Thị F',
      phone: '0111111111',
      email: 'lethif@email.com',
      position: 'Dọn Phòng',
      role: 'Nhân Viên',
      salary: 6000000,
      hireDate: '2023-03-10',
      status: 'inactive'
    },
  ]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [form] = Form.useForm();

  const columns = [
    {
      title: 'Ảnh',
      dataIndex: 'avatar',
      key: 'avatar',
      render: () => <Avatar icon={<UserOutlined />} />,
    },
    {
      title: 'Tên Nhân Viên',
      dataIndex: 'name',
      key: 'name',
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: 'Chức Vụ',
      dataIndex: 'position',
      key: 'position',
      filters: [
        { text: 'Lễ Tân', value: 'Lễ Tân' },
        { text: 'Quản Lý', value: 'Quản Lý' },
        { text: 'Dọn Phòng', value: 'Dọn Phòng' },
        { text: 'Bảo Vệ', value: 'Bảo Vệ' },
        { text: 'Kế Toán', value: 'Kế Toán' },
      ],
      onFilter: (value, record) => record.position.includes(value),
    },
    {
      title: 'Vai Trò',
      dataIndex: 'role',
      key: 'role',
      filters: [
        { text: 'Quản Lý', value: 'Quản Lý' },
        { text: 'Nhân Viên', value: 'Nhân Viên' },
        { text: 'Admin', value: 'Admin' },
      ],
      onFilter: (value, record) => record.role.includes(value),
      render: (role) => {
        const roleColors = {
          'Admin': '#f5222d',
          'Quản Lý': '#1890ff',
          'Nhân Viên': '#52c41a',
        };
        return <Tag color={roleColors[role] || '#d9d9d9'}>{role}</Tag>;
      },
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
      title: 'Lương',
      dataIndex: 'salary',
      key: 'salary',
      render: (salary) => `${salary.toLocaleString()} VNĐ`,
      sorter: (a, b) => a.salary - b.salary,
    },
    {
      title: 'Ngày Vào Làm',
      dataIndex: 'hireDate',
      key: 'hireDate',
      sorter: (a, b) => new Date(a.hireDate) - new Date(b.hireDate),
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusMap = {
          active: { color: '#52c41a', text: 'Đang Làm Việc' },
          inactive: { color: '#f5222d', text: 'Đã Nghỉ Việc' },
        };
        const { color, text } = statusMap[status] || { color: 'default', text: status };
        return <Tag color={color}>{text}</Tag>;
      },
      filters: [
        { text: 'Đang Làm Việc', value: 'active' },
        { text: 'Đã Nghỉ Việc', value: 'inactive' },
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
            title="Bạn có chắc muốn xóa nhân viên này?"
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
    setEditingStaff(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (staffMember) => {
    setEditingStaff(staffMember);
    form.setFieldsValue({
      ...staffMember,
      hireDate: dayjs(staffMember.hireDate)
    });
    setIsModalVisible(true);
  };

  const handleDelete = (id) => {
    setStaff(staff.filter(member => member.id !== id));
    message.success('Xóa nhân viên thành công!');
  };

  const handleModalOk = () => {
    form.validateFields().then(values => {
      const staffData = {
        ...values,
        hireDate: values.hireDate.format('YYYY-MM-DD'),
      };

      if (editingStaff) {
        setStaff(staff.map(member =>
          member.id === editingStaff.id ? { ...member, ...staffData } : member
        ));
        message.success('Cập nhật nhân viên thành công!');
      } else {
        const newStaff = {
          ...staffData,
          id: Math.max(...staff.map(s => s.id)) + 1,
        };
        setStaff([...staff, newStaff]);
        message.success('Thêm nhân viên thành công!');
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
        <h1>Quản Lý Nhân Viên</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Thêm Nhân Viên Mới
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={staff}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingStaff ? 'Sửa Thông Tin Nhân Viên' : 'Thêm Nhân Viên Mới'}
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
            label="Tên Nhân Viên"
            rules={[{ required: true, message: 'Vui lòng nhập tên nhân viên!' }]}
          >
            <Input placeholder="Nhập tên nhân viên" />
          </Form.Item>

          <Form.Item
            name="position"
            label="Chức Vụ"
            rules={[{ required: true, message: 'Vui lòng chọn chức vụ!' }]}
          >
            <Select placeholder="Chọn chức vụ">
              <Option value="Lễ Tân">Lễ Tân</Option>
              <Option value="Quản Lý">Quản Lý</Option>
              <Option value="Dọn Phòng">Dọn Phòng</Option>
              <Option value="Bảo Vệ">Bảo Vệ</Option>
              <Option value="Kế Toán">Kế Toán</Option>
              <Option value="Đầu Bếp">Đầu Bếp</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="role"
            label="Vai Trò"
            rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}
          >
            <Select placeholder="Chọn vai trò">
              <Option value="Admin">Admin</Option>
              <Option value="Quản Lý">Quản Lý</Option>
              <Option value="Nhân Viên">Nhân Viên</Option>
            </Select>
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
            name="salary"
            label="Lương (VNĐ)"
            rules={[{ required: true, message: 'Vui lòng nhập lương!' }]}
          >
            <Input
              type="number"
              placeholder="Nhập lương"
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>

          <Form.Item
            name="hireDate"
            label="Ngày Vào Làm"
            rules={[{ required: true, message: 'Vui lòng chọn ngày vào làm!' }]}
          >
            <DatePicker style={{ width: '100%' }} placeholder="Chọn ngày vào làm" />
          </Form.Item>

          <Form.Item
            name="status"
            label="Trạng Thái"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
          >
            <Select placeholder="Chọn trạng thái">
              <Option value="active">Đang Làm Việc</Option>
              <Option value="inactive">Đã Nghỉ Việc</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default StaffManagement;