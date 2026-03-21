import React, { useState } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  DatePicker,
  message,
  Space,
  Tag,
  Popconfirm,
  InputNumber
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Option } = Select;
const { RangePicker } = DatePicker;

const BookingManagement = () => {
  const [bookings, setBookings] = useState([
    {
      id: 1,
      customerName: 'Nguyễn Văn A',
      customerPhone: '0123456789',
      customerEmail: 'nguyenvana@email.com',
      roomNumber: '101',
      roomType: 'Phòng Đơn',
      checkIn: '2024-03-20',
      checkOut: '2024-03-22',
      status: 'confirmed',
      totalPrice: 1000000,
      notes: 'Khách yêu cầu view biển'
    },
    {
      id: 2,
      customerName: 'Trần Thị B',
      customerPhone: '0987654321',
      customerEmail: 'tranthib@email.com',
      roomNumber: '205',
      roomType: 'Phòng Gia Đình',
      checkIn: '2024-03-25',
      checkOut: '2024-03-28',
      status: 'pending',
      totalPrice: 3600000,
      notes: ''
    },
  ]);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingBooking, setEditingBooking] = useState(null);
  const [form] = Form.useForm();

  const columns = [
    {
      title: 'Tên Khách Hàng',
      dataIndex: 'customerName',
      key: 'customerName',
      sorter: (a, b) => a.customerName.localeCompare(b.customerName),
    },
    {
      title: 'Số Điện Thoại',
      dataIndex: 'customerPhone',
      key: 'customerPhone',
    },
    {
      title: 'Phòng',
      dataIndex: 'roomNumber',
      key: 'roomNumber',
      render: (text, record) => `${text} (${record.roomType})`,
    },
    {
      title: 'Ngày Nhận Phòng',
      dataIndex: 'checkIn',
      key: 'checkIn',
      sorter: (a, b) => new Date(a.checkIn) - new Date(b.checkIn),
    },
    {
      title: 'Ngày Trả Phòng',
      dataIndex: 'checkOut',
      key: 'checkOut',
      sorter: (a, b) => new Date(a.checkOut) - new Date(b.checkOut),
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusMap = {
          pending: { color: '#faad14', text: 'Chờ Xác Nhận' },
          confirmed: { color: '#52c41a', text: 'Đã Xác Nhận' },
          cancelled: { color: '#f5222d', text: 'Đã Hủy' },
          completed: { color: '#1890ff', text: 'Hoàn Thành' },
        };
        const { color, text } = statusMap[status] || { color: 'default', text: status };
        return <Tag color={color}>{text}</Tag>;
      },
      filters: [
        { text: 'Chờ Xác Nhận', value: 'pending' },
        { text: 'Đã Xác Nhận', value: 'confirmed' },
        { text: 'Đã Hủy', value: 'cancelled' },
        { text: 'Hoàn Thành', value: 'completed' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Tổng Tiền',
      dataIndex: 'totalPrice',
      key: 'totalPrice',
      render: (price) => `${price.toLocaleString()} VNĐ`,
      sorter: (a, b) => a.totalPrice - b.totalPrice,
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
          {record.status === 'pending' && (
            <>
              <Button
                type="link"
                icon={<CheckCircleOutlined />}
                style={{ color: '#52c41a' }}
                onClick={() => handleConfirm(record.id)}
              >
                Xác Nhận
              </Button>
              <Button
                type="link"
                danger
                icon={<CloseCircleOutlined />}
                onClick={() => handleCancel(record.id)}
              >
                Hủy
              </Button>
            </>
          )}
          <Popconfirm
            title="Bạn có chắc muốn xóa đặt phòng này?"
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
    setEditingBooking(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (booking) => {
    setEditingBooking(booking);
    form.setFieldsValue({
      ...booking,
      dateRange: [dayjs(booking.checkIn), dayjs(booking.checkOut)]
    });
    setIsModalVisible(true);
  };

  const handleDelete = (id) => {
    setBookings(bookings.filter(booking => booking.id !== id));
    message.success('Xóa đặt phòng thành công!');
  };

  const handleConfirm = (id) => {
    setBookings(bookings.map(booking =>
      booking.id === id ? { ...booking, status: 'confirmed' } : booking
    ));
    message.success('Xác nhận đặt phòng thành công!');
  };

  const handleCancel = (id) => {
    setBookings(bookings.map(booking =>
      booking.id === id ? { ...booking, status: 'cancelled' } : booking
    ));
    message.success('Hủy đặt phòng thành công!');
  };

  const handleModalOk = () => {
    form.validateFields().then(values => {
      const [checkIn, checkOut] = values.dateRange;
      const bookingData = {
        ...values,
        checkIn: checkIn.format('YYYY-MM-DD'),
        checkOut: checkOut.format('YYYY-MM-DD'),
        dateRange: undefined,
      };

      if (editingBooking) {
        setBookings(bookings.map(booking =>
          booking.id === editingBooking.id ? { ...booking, ...bookingData } : booking
        ));
        message.success('Cập nhật đặt phòng thành công!');
      } else {
        const newBooking = {
          ...bookingData,
          id: Math.max(...bookings.map(b => b.id)) + 1,
          status: 'pending',
        };
        setBookings([...bookings, newBooking]);
        message.success('Thêm đặt phòng thành công!');
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
        <h1>Quản Lý Đặt Phòng</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Thêm Đặt Phòng Mới
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={bookings}
        rowKey="id"
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingBooking ? 'Sửa Đặt Phòng' : 'Thêm Đặt Phòng Mới'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="customerName"
            label="Tên Khách Hàng"
            rules={[{ required: true, message: 'Vui lòng nhập tên khách hàng!' }]}
          >
            <Input placeholder="Nhập tên khách hàng" />
          </Form.Item>

          <Form.Item
            name="customerPhone"
            label="Số Điện Thoại"
            rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
          >
            <Input placeholder="Nhập số điện thoại" />
          </Form.Item>

          <Form.Item
            name="customerEmail"
            label="Email"
            rules={[
              { required: true, message: 'Vui lòng nhập email!' },
              { type: 'email', message: 'Email không hợp lệ!' }
            ]}
          >
            <Input placeholder="Nhập email" />
          </Form.Item>

          <Form.Item
            name="roomNumber"
            label="Số Phòng"
            rules={[{ required: true, message: 'Vui lòng nhập số phòng!' }]}
          >
            <Input placeholder="Ví dụ: 101" />
          </Form.Item>

          <Form.Item
            name="roomType"
            label="Loại Phòng"
            rules={[{ required: true, message: 'Vui lòng chọn loại phòng!' }]}
          >
            <Select placeholder="Chọn loại phòng">
              <Option value="Phòng Đơn">Phòng Đơn</Option>
              <Option value="Phòng Đôi">Phòng Đôi</Option>
              <Option value="Phòng Gia Đình">Phòng Gia Đình</Option>
              <Option value="Phòng Suite">Phòng Suite</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="dateRange"
            label="Thời Gian Ở"
            rules={[{ required: true, message: 'Vui lòng chọn thời gian!' }]}
          >
            <RangePicker
              style={{ width: '100%' }}
              placeholder={['Ngày nhận phòng', 'Ngày trả phòng']}
            />
          </Form.Item>

          <Form.Item
            name="totalPrice"
            label="Tổng Tiền (VNĐ)"
            rules={[{ required: true, message: 'Vui lòng nhập tổng tiền!' }]}
          >
            <InputNumber
              min={0}
              step={50000}
              style={{ width: '100%' }}
              formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>

          <Form.Item
            name="notes"
            label="Ghi Chú"
          >
            <Input.TextArea rows={3} placeholder="Ghi chú đặc biệt" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default BookingManagement;