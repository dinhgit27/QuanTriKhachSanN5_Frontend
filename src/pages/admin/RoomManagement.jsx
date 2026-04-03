import React, { useState, useEffect } from 'react';
import { 
  Table, Button, Space, Tag, Modal, Form, Input, 
  Select, message, Card, Typography, Popconfirm 
} from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, 
  CheckCircleOutlined, SyncOutlined, SearchOutlined 
} from '@ant-design/icons';
import { roomApi } from '../../api/roomApi';
import { useAuditLog } from '../../hooks/useAuditLog'; 

const { Title, Text } = Typography;
const { Option } = Select;
const { Search } = Input;

const RoomManagement = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { logAction } = useAuditLog();
  
  // --- STATE PHỤC VỤ TÌM KIẾM & BỘ LỌC ---
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [filterCleaning, setFilterCleaning] = useState('All'); // Thêm lọc dọn dẹp nè Đỉnh
  
  const [editingRoom, setEditingRoom] = useState(null); 
  const [form] = Form.useForm();

  // --- 1. HÚT DATA ---
  const fetchRooms = async () => {
    setLoading(true);
    try {
      const response = await roomApi.getRooms();
      setRooms(response.data);
    } catch (error) {
      message.error("Lỗi kết nối Backend!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  // --- 2. LOGIC LỌC TỔNG HỢP (SEARCH + STATUS + CLEANING) ---
  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.roomNumber.toLowerCase().includes(searchText.toLowerCase());
    const matchesStatus = filterStatus === 'All' || room.status === filterStatus;
    const matchesCleaning = filterCleaning === 'All' || room.cleaningStatus === filterCleaning;
    return matchesSearch && matchesStatus && matchesCleaning;
  });

  // --- 3. CÁC HÀM XỬ LÝ (GIỮ NGUYÊN LOGIC CŨ) ---
  const handleAddNew = () => {
    setEditingRoom(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record) => {
    setEditingRoom(record);
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields(); 
      setLoading(true);
      const payload = {
        id: editingRoom ? editingRoom.id : 0,
        ...values,
        floor: Number(values.floor),
        roomTypeId: Number(values.roomTypeId || 1)
      };

      if (editingRoom) {
        await roomApi.updateRoom(editingRoom.id, payload);
        logAction({
          action: 'Sửa',
          actionType: 'UPDATE',
          module: 'Quản lý Phòng',
          objectName: `Phòng ${payload.roomNumber}`,
          description: `Cập nhật thông tin phòng: ${payload.roomNumber}`,
          oldValue: editingRoom,
          newValue: payload,
        });
        message.success("Cập nhật thành công!");
      } else {
        await roomApi.createRoom(payload);
        logAction({
          action: 'Thêm',
          actionType: 'CREATE',
          module: 'Quản lý Phòng',
          objectName: `Phòng ${payload.roomNumber}`,
          description: `Thêm phòng mới: ${payload.roomNumber}`,
          oldValue: null,
          newValue: payload,
        });
        message.success("Thêm mới thành công!");
      }
      setIsModalVisible(false);
      fetchRooms();
    } catch (error) {
      const msg = error.response?.data?.message || "Có lỗi xảy ra!";
      message.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    try {
      const room = rooms.find(r => r.id === id);
      const roomNumber = room?.roomNumber || 'Phòng';
      
      await roomApi.deleteRoom(id);
      logAction({
        action: 'Xóa',
        actionType: 'DELETE',
        module: 'Quản lý Phòng',
        objectName: `Phòng ${roomNumber}`,
        description: `Xóa phòng: ${roomNumber}`,
        oldValue: room,
      });
      message.success("Đã xóa!");
      fetchRooms();
    } catch (error) {
      message.error(error.response?.data?.message || "Lỗi xóa!");
    }
  };

  // --- 4. ĐỊNH NGHĨA CỘT BẢNG ---
  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: 'Số Phòng', dataIndex: 'roomNumber', key: 'roomNumber', render: t => <b>{t}</b> },
    { title: 'Tầng', dataIndex: 'floor', key: 'floor' },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
      render: s => {
        let color = s === 'Available' ? 'green' : s === 'Occupied' ? 'red' : 'orange';
        return <Tag color={color}>{s || 'N/A'}</Tag>;
      },
    },
    {
      title: 'Dọn Dẹp',
      dataIndex: 'cleaningStatus',
      key: 'cleaningStatus',
      render: s => {
        let color = s === 'Clean' ? 'cyan' : 'warning';
        return <Tag icon={s === 'Clean' ? <CheckCircleOutlined /> : <SyncOutlined spin />} color={color}>{s || 'N/A'}</Tag>;
      },
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="primary" ghost icon={<EditOutlined />} size="small" onClick={() => handleEdit(record)}>Sửa</Button>
          <Popconfirm title="Xóa phòng?" onConfirm={() => handleDelete(record.id)} okText="Xóa" cancelText="Hủy" okButtonProps={{ danger: true }}>
            <Button type="primary" danger icon={<DeleteOutlined />} size="small">Xóa</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card style={{ margin: 24, borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
      {/* PHẦN TIÊU ĐỀ */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Quản Lý Phòng</Title>
          <Text type="secondary">Tìm kiếm và lọc thông tin phòng nhanh chóng</Text>
        </div>
        <Button type="primary" size="large" icon={<PlusOutlined />} onClick={handleAddNew} style={{ borderRadius: 8 }}>
          Thêm Phòng Mới
        </Button>
      </div>

      {/* --- BỘ LỌC DÀN HÀNG NGANG (GIỐNG HÌNH MẪU CỦA ĐỈNH) --- */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: 24, flexWrap: 'wrap' }}>
        <Search
          placeholder="Tìm theo số phòng..."
          allowClear
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 300 }}
          prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
        />
        
        <Select 
          placeholder="Tất cả trạng thái" 
          style={{ width: 200 }} 
          onChange={(val) => setFilterStatus(val)}
          defaultValue="All"
        >
          <Option value="All">Tất cả trạng thái</Option>
          <Option value="Available">Trống (Available)</Option>
          <Option value="Occupied">Đang ở (Occupied)</Option>
          <Option value="Maintenance">Bảo trì (Maintenance)</Option>
        </Select>

        <Select 
          placeholder="Tình trạng dọn dẹp" 
          style={{ width: 220 }} 
          onChange={(val) => setFilterCleaning(val)}
          defaultValue="All"
        >
          <Option value="All">Tất cả tình trạng dọn dẹp</Option>
          <Option value="Clean">Sạch sẽ (Clean)</Option>
          <Option value="Dirty">Chưa dọn (Dirty)</Option>
          <Option value="Inspecting">Đang kiểm tra (Inspecting)</Option>
        </Select>
      </div>

      {/* BẢNG DỮ LIỆU */}
      <Table 
        columns={columns} 
        dataSource={filteredRooms} 
        rowKey="id" 
        loading={loading}
        pagination={{ pageSize: 8, showTotal: (t) => `Tổng cộng ${t} phòng` }}
      />

      {/* MODAL (GIỮ NGUYÊN) */}
      <Modal
        title={editingRoom ? "Sửa Thông Tin" : "Thêm Mới"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={handleSave}
        confirmLoading={loading}
        centered
      >
        <Form form={form} layout="vertical" style={{ marginTop: 15 }}>
          <Form.Item label="Số Phòng" name="roomNumber" rules={[{ required: true }]}>
            <Input placeholder="101..." />
          </Form.Item>
          <Space>
            <Form.Item label="Tầng" name="floor" rules={[{ required: true }]}><Input type="number" style={{ width: 220 }} /></Form.Item>
            <Form.Item label="Mã Loại" name="roomTypeId" rules={[{ required: true }]}><Input type="number" style={{ width: 220 }} /></Form.Item>
          </Space>
          <Form.Item label="Trạng Thái" name="status" initialValue="Available">
            <Select><Option value="Available">Trống</Option><Option value="Occupied">Đang ở</Option><Option value="Maintenance">Bảo trì</Option></Select>
          </Form.Item>
          <Form.Item label="Dọn Dẹp" name="cleaningStatus" initialValue="Clean">
            <Select><Option value="Clean">Sạch sẽ</Option><Option value="Dirty">Chưa dọn</Option><Option value="Inspecting">Đang kiểm tra</Option></Select>
          </Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default RoomManagement;