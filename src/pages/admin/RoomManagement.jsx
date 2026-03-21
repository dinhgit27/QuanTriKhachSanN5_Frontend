import React, { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Select,
  InputNumber,
  message,
  Space,
  Tag,
  Popconfirm
} from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  SearchOutlined
} from '@ant-design/icons';
import { roomAPI } from '../../services/api';

const { Option } = Select;

const RoomManagement = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [form] = Form.useForm();

  // Fetch rooms from API
  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await roomAPI.getAll();
      setRooms(response.data);
    } catch (error) {
      message.error('Không thể tải danh sách phòng');
      console.error('Error fetching rooms:', error);
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Số Phòng',
      dataIndex: 'number',
      key: 'number',
      sorter: (a, b) => a.number.localeCompare(b.number),
    },
    {
      title: 'Loại Phòng',
      dataIndex: 'type',
      key: 'type',
      filters: [
        { text: 'Phòng Đơn', value: 'Phòng Đơn' },
        { text: 'Phòng Đôi', value: 'Phòng Đôi' },
        { text: 'Phòng Gia Đình', value: 'Phòng Gia Đình' },
        { text: 'Phòng Suite', value: 'Phòng Suite' },
      ],
      onFilter: (value, record) => record.type.includes(value),
    },
    {
      title: 'Giá/Ngày',
      dataIndex: 'price',
      key: 'price',
      render: (price) => `${price.toLocaleString()} VNĐ`,
      sorter: (a, b) => a.price - b.price,
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      render: (status) => {
        const statusMap = {
          available: { color: '#52c41a', text: 'Trống' },
          occupied: { color: '#f5222d', text: 'Đã Đặt' },
          maintenance: { color: '#faad14', text: 'Bảo Trì' },
        };
        const { color, text } = statusMap[status] || { color: 'default', text: status };
        return <Tag color={color}>{text}</Tag>;
      },
      filters: [
        { text: 'Trống', value: 'available' },
        { text: 'Đã Đặt', value: 'occupied' },
        { text: 'Bảo Trì', value: 'maintenance' },
      ],
      onFilter: (value, record) => record.status === value,
    },
    {
      title: 'Sức Chứa',
      dataIndex: 'capacity',
      key: 'capacity',
      sorter: (a, b) => a.capacity - b.capacity,
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
            title="Bạn có chắc muốn xóa phòng này?"
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
    setEditingRoom(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (room) => {
    setEditingRoom(room);
    form.setFieldsValue(room);
    setIsModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await roomAPI.delete(id);
      message.success('Xóa phòng thành công!');
      fetchRooms(); // Refresh data
    } catch (error) {
      message.error('Không thể xóa phòng');
      console.error('Error deleting room:', error);
    }
  };

  const handleModalOk = () => {
    form.validateFields().then(async (values) => {
      try {
        if (editingRoom) {
          await roomAPI.update(editingRoom.id, values);
          message.success('Cập nhật phòng thành công!');
        } else {
          await roomAPI.create(values);
          message.success('Thêm phòng thành công!');
        }
        setIsModalVisible(false);
        form.resetFields();
        fetchRooms(); // Refresh data
      } catch (error) {
        message.error(editingRoom ? 'Không thể cập nhật phòng' : 'Không thể thêm phòng');
        console.error('Error saving room:', error);
      }
    });
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
        <h1>Quản Lý Phòng</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Thêm Phòng Mới
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={rooms}
        rowKey="id"
        pagination={{ pageSize: 10 }}
        loading={loading}
      />

      <Modal
        title={editingRoom ? 'Sửa Phòng' : 'Thêm Phòng Mới'}
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
            name="number"
            label="Số Phòng"
            rules={[{ required: true, message: 'Vui lòng nhập số phòng!' }]}
          >
            <Input placeholder="Ví dụ: 101" />
          </Form.Item>

          <Form.Item
            name="type"
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
            name="price"
            label="Giá/Ngày (VNĐ)"
            rules={[{ required: true, message: 'Vui lòng nhập giá!' }]}
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
            name="status"
            label="Trạng Thái"
            rules={[{ required: true, message: 'Vui lòng chọn trạng thái!' }]}
          >
            <Select placeholder="Chọn trạng thái">
              <Option value="available">Trống</Option>
              <Option value="occupied">Đã Đặt</Option>
              <Option value="maintenance">Bảo Trì</Option>
            </Select>
          </Form.Item>

          <Form.Item
            name="capacity"
            label="Sức Chứa"
            rules={[{ required: true, message: 'Vui lòng nhập sức chứa!' }]}
          >
            <InputNumber min={1} max={10} style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item
            name="description"
            label="Mô Tả"
          >
            <Input.TextArea rows={3} placeholder="Mô tả chi tiết về phòng" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default RoomManagement;