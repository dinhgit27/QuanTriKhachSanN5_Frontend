import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, Modal, Form, Input, Select, message, Card, Typography, Popconfirm, InputNumber } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, BuildOutlined, SearchOutlined } from '@ant-design/icons';
// Giả sử ní đã tạo inventoryApi, nếu chưa thì tạm dùng axios gọi thẳng
import axios from 'axios'; 

const { Title, Text } = Typography;
const { Option } = Select;
const { Search } = Input;

const InventoryManagement = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();

  // --- 1. LẤY DATA (Ní nhớ đổi URL cho đúng cổng C# của ní nha) ---
  const fetchData = async () => {
    setLoading(true);
    try {
      // Móc thẻ VIP từ LocalStorage (Dự án React thường lưu token ở đây)
      // Chú ý: Nếu code của ní lưu tên khác thì đổi chữ 'token' thành 'accessToken' nha
      const token = localStorage.getItem('token'); 

      const res = await axios.get('https://localhost:5070/api/RoomInventory', {
        headers: {
          Authorization: `Bearer ${token}` // Trình thẻ cho C# xem
        }
      });
      
      setData(res.data);
    } catch (err) {
      console.error("Lỗi chi tiết:", err);
      if (err.response?.status === 401) {
        message.error("Lỗi 401: Ní chưa đăng nhập hoặc Token bị hết hạn rồi!");
      } else {
        message.error("Không lấy được dữ liệu vật tư!");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // --- 2. LOGIC LỌC DỮ LIỆU ---
  const filteredData = data.filter(item => {
    const matchSearch = item.room?.roomNumber?.toLowerCase().includes(searchText.toLowerCase()) || 
                        item.amenity?.name?.toLowerCase().includes(searchText.toLowerCase());
    const matchType = filterType === 'All' || item.itemType === filterType;
    return matchSearch && matchType;
  });

  // --- 3. CÁC HÀM XỬ LÝ (Mô hình chuẩn như trang Phòng) ---
  const handleSave = async (values) => {
    // Logic POST/PUT ở đây
    message.success("Đã lưu thay đổi vật tư!");
    setIsModalVisible(false);
  };

  // --- 4. CẤU HÌNH CỘT ---
  const columns = [
    { title: 'Phòng', dataIndex: ['room', 'roomNumber'], key: 'room', render: t => <b>{t || 'N/A'}</b> },
    { title: 'Tên Vật Tư', dataIndex: ['amenity', 'name'], key: 'amenity' },
    { title: 'Số lượng', dataIndex: 'quantity', key: 'quantity', align: 'center' },
    { 
      title: 'Giá đền bù', 
      dataIndex: 'priceIfLost', 
      key: 'priceIfLost',
      render: val => <Text type="danger">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val)}</Text>
    },
    { title: 'Loại', dataIndex: 'itemType', key: 'itemType', render: type => <Tag color="blue">{type}</Tag> },
    { 
      title: 'Trạng thái', 
      dataIndex: 'isActive', 
      key: 'isActive',
      render: active => <Tag color={active ? 'green' : 'red'}>{active ? 'Đang dùng' : 'Hỏng/Mất'}</Tag>
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space>
          <Button type="primary" ghost icon={<EditOutlined />} size="small" onClick={() => { setEditingItem(record); form.setFieldsValue(record); setIsModalVisible(true); }}>Sửa</Button>
          <Popconfirm title="Xóa vật tư này khỏi phòng?"><Button type="primary" danger icon={<DeleteOutlined />} size="small">Xóa</Button></Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card style={{ margin: 24, borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Quản Lý Vật Tư & Trang Thiết Bị</Title>
          <Text type="secondary">Theo dõi danh sách vật tư theo từng phòng khách sạn</Text>
        </div>
        <Button type="primary" size="large" icon={<PlusOutlined />} onClick={() => { setEditingItem(null); form.resetFields(); setIsModalVisible(true); }}>
          Cấp vật tư mới
        </Button>
      </div>

      {/* BỘ LỌC DÀN HÀNG NGANG (YÊU CẦU CỦA ĐỈNH) */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: 24 }}>
        <Search
          placeholder="Tìm theo số phòng hoặc tên vật tư..."
          allowClear
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 350 }}
          prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
        />
        
        <Select 
          placeholder="Lọc theo loại vật tư" 
          style={{ width: 200 }} 
          onChange={(val) => setFilterType(val)}
          defaultValue="All"
        >
          <Option value="All">Tất cả loại</Option>
          <Option value="Electronics">Điện tử</Option>
          <Option value="Furniture">Nội thất</Option>
          <Option value="Amenity">Tiện ích tiêu hao</Option>
        </Select>

        <Select placeholder="Tình trạng" style={{ width: 180 }} defaultValue="All">
          <Option value="All">Tất cả trạng thái</Option>
          <Option value="Active">Đang dùng</Option>
          <Option value="Inactive">Hỏng/Mất</Option>
        </Select>
      </div>

      <Table 
        columns={columns} 
        dataSource={filteredData} 
        rowKey="id" 
        loading={loading}
        pagination={{ pageSize: 8 }}
      />

      <Modal
        title={editingItem ? "Sửa thông tin vật tư" : "Cấp vật tư mới cho phòng"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={() => form.submit()}
      >
        <Form form={form} layout="vertical" onFinish={handleSave} style={{ marginTop: 15 }}>
          <Form.Item label="Chọn Phòng" name="roomId" rules={[{ required: true }]}><Input placeholder="ID Phòng" /></Form.Item>
          <Form.Item label="Chọn Vật Tư" name="amenityId" rules={[{ required: true }]}><Input placeholder="ID Vật tư" /></Form.Item>
          <Space>
            <Form.Item label="Số lượng" name="quantity" rules={[{ required: true }]}><InputNumber min={1} style={{ width: 220 }} /></Form.Item>
            <Form.Item label="Giá đền bù" name="priceIfLost" rules={[{ required: true }]}><InputNumber style={{ width: 220 }} formatter={value => `₫ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} /></Form.Item>
          </Space>
          <Form.Item label="Ghi chú" name="note"><Input.TextArea placeholder="Tình trạng lúc cấp..." /></Form.Item>
        </Form>
      </Modal>
    </Card>
  );
};

export default InventoryManagement;