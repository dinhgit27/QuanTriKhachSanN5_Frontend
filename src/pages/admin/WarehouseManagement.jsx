import React, { useState, useEffect } from 'react';
import { 
  Table, Button, Space, Tag, Modal, Form, Input, 
  Select, message, Card, Typography, InputNumber, Upload, Row, Col, Popconfirm 
} from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, 
  UploadOutlined, LoadingOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { useAuditLog } from '../../hooks/useAuditLog';

const { Title, Text } = Typography;
const { Option } = Select;

const WarehouseManagement = () => {
  const { logAction } = useAuditLog();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  const [form] = Form.useForm();

  // --- 1. LẤY DỮ LIỆU TỪ KHO ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('https://localhost:5070/api/Amenities', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data);
    } catch (err) {
      console.error(err);
      message.error("Lỗi khi tải dữ liệu kho!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- 2. UPLOAD ẢNH LÊN CLOUDINARY (ĐÃ FIX THEO HÌNH NÍ CHỤP) ---
  const handleUploadCloudinary = async (options) => {
    const { file, onSuccess, onError } = options;
    setUploading(true);
    
    // Thông tin lấy từ hình ní gửi: Cloud Name là dqx8hqmcv
    const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dqx8hqmcv/image/upload';
    // Tên Preset ní vừa tạo: QuanTriKhachSanN5_IMG
    const UPLOAD_PRESET = 'QuanTriKhachSanN5_IMG'; 

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', UPLOAD_PRESET);

    try {
      const res = await axios.post(CLOUDINARY_URL, formData);
      const uploadedUrl = res.data.secure_url;
      setImageUrl(uploadedUrl); 
      form.setFieldsValue({ imageUrl: uploadedUrl }); 
      onSuccess("Ok");
      message.success('Tải ảnh lên Cloud thành công!');
    } catch (err) {
      console.error("Lỗi upload Cloudinary:", err);
      onError({ err });
      message.error('Tải ảnh thất bại! Kiểm tra lại cấu hình Unsigned.');
    } finally {
      setUploading(false);
    }
  };

  // --- 3. MỞ FORM THÊM MỚI ---
  const handleAddNew = () => {
    setEditingItem(null);
    setImageUrl('');
    form.resetFields();
    setIsModalVisible(true);
  };

  // --- 4. MỞ FORM SỬA ---
  const handleEdit = (record) => {
    setEditingItem(record);
    setImageUrl(record.imageUrl); 
    form.setFieldsValue(record);
    setIsModalVisible(true);
  };

  // --- 5. LƯU DỮ LIỆU ---
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

      if (editingItem) {
        // Update
        await axios.put(`https://localhost:5070/api/Amenities/${editingItem.id}`, { ...editingItem, ...values }, { headers });
        
        // Log action
        logAction({
          action: 'Sửa',
          actionType: 'UPDATE',
          module: 'Kho Vật Tư',
          objectName: values.name,
          description: `Cập nhật thông tin vật tư: ${values.name}`,
          oldValue: editingItem,
          newValue: values,
        });
        
        message.success('Đã cập nhật thông tin vật tư!');
      } else {
        // Create
        await axios.post('https://localhost:5070/api/Amenities', values, { headers });
        
        // Log action
        logAction({
          action: 'Thêm',
          actionType: 'CREATE',
          module: 'Kho Vật Tư',
          objectName: values.name,
          description: `Thêm vật tư mới: ${values.name}`,
          newValue: values,
        });
        
        message.success('Đã nhập vật tư mới vào kho!');
      }

      setIsModalVisible(false);
      fetchData();
    } catch (error) {
      console.log("Lỗi form:", error);
    }
  };

  // --- 6. XÓA VẬT TƯ ---
  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      
      // Tìm item để ghi log
      const deletingItem = data.find(item => item.id === id);
      const itemName = deletingItem?.name || 'Vật tư';
      
      await axios.delete(`https://localhost:5070/api/Amenities/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      // Log action
      logAction({
        action: 'Xóa',
        actionType: 'DELETE',
        module: 'Kho Vật Tư',
        objectName: itemName,
        description: `Xóa vật tư: ${itemName}`,
        oldValue: { name: itemName, quantity: deletingItem?.quantity, price: deletingItem?.price },
      });
      
      message.success("Đã xóa vật tư!");
      fetchData();
    } catch (err) {
      message.error("Lỗi khi xóa!");
    }
  };

  const columns = [
    { 
      title: 'Ảnh', 
      dataIndex: 'imageUrl', 
      key: 'imageUrl', 
      render: (img) => img ? <img src={img} alt="item" style={{ width: 45, height: 45, objectFit: 'cover', borderRadius: 6, border: '1px solid #f0f0f0' }} /> : <Tag>No Image</Tag>
    },
    { title: 'Tên vật tư', dataIndex: 'name', key: 'name', render: t => <Text strong>{t}</Text> },
    { 
    title: 'Tổng sở hữu', 
    dataIndex: 'totalQuantity', 
    key: 'totalQuantity',
    render: (q, record) => <Tag color="blue">{q} {record.unit}</Tag>
  },

  // CỘT 2: ĐÃ CẤP CHO PHÒNG
  { 
    title: 'Đã cấp cho phòng', 
    dataIndex: 'issuedQuantity', 
    key: 'issuedQuantity',
    render: (q, record) => <Tag color="orange">{q} {record.unit}</Tag>
  },

  // CỘT 3: CÓ THỂ CẤP (CÒN TRONG KHO)
  { 
    title: 'Có thể cấp (Kho)', 
    dataIndex: 'availableQuantity', 
    key: 'availableQuantity',
    render: (q, record) => (
      <b style={{ color: q > 0 ? '#52c41a' : '#f5222d' }}>
        {q} {record.unit}
      </b>
    )
  },
    { title: 'Danh mục', dataIndex: 'category', key: 'category', render: c => <Tag color="blue">{c}</Tag> },
    { 
      title: 'Giá nhập', 
      dataIndex: 'importPrice', 
      key: 'importPrice',
      render: p => <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p || 0)}</span>
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Button type="primary" ghost icon={<EditOutlined />} onClick={() => handleEdit(record)}>Sửa</Button>
          <Popconfirm title="Xóa vật tư này?" onConfirm={() => handleDelete(record.id)} okText="Xóa" cancelText="Hủy">
            <Button type="primary" danger icon={<DeleteOutlined />}>Xóa</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Card style={{ margin: 24, borderRadius: 12, boxShadow: '0 4px 20px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <Title level={3} style={{ margin: 0 }}>Kho Vật Tư Khách Sạn</Title>
          <Text type="secondary">Quản lý nhập xuất vật tư tổng trên hệ thống Cloud</Text>
        </div>
        <Button type="primary" size="large" icon={<PlusOutlined />} onClick={handleAddNew} style={{ borderRadius: 8, height: 45 }}>
          Nhập vật tư mới
        </Button>
      </div>

      <Table columns={columns} dataSource={data} rowKey="id" loading={loading} pagination={{ pageSize: 8 }} />

      <Modal
        title={editingItem ? "Cập Nhật Vật Tư" : "Thêm Vật Tư Vào Kho"}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onOk={handleSave}
        width={720}
        centered
        okText="Lưu dữ liệu"
        cancelText="Đóng"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 15 }}>
          <Form.Item name="imageUrl" hidden><Input /></Form.Item>

          <Row gutter={16}>
            <Col span={24}>
              <Form.Item label="Hình ảnh (Cloudinary)">
                <Upload 
                  customRequest={handleUploadCloudinary}
                  showUploadList={false}
                  accept="image/*"
                >
                  <Button icon={uploading ? <LoadingOutlined /> : <UploadOutlined />} loading={uploading}>
                    {uploading ? 'Đang tải lên...' : 'Chọn ảnh từ máy tính'}
                  </Button>
                </Upload>
                {imageUrl && (
                  <div style={{ marginTop: 15 }}>
                    <img src={imageUrl} alt="preview" style={{ width: 120, height: 120, objectFit: 'cover', borderRadius: 8, border: '2px solid #fadb14' }} />
                  </div>
                )}
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Tên vật tư" name="name" rules={[{ required: true }]}>
                <Input placeholder="VD: Khăn tắm, Tivi..." />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Danh mục" name="category" rules={[{ required: true }]}>
                <Select placeholder="Chọn danh mục">
                  <Option value="Tiêu hao">Đồ tiêu hao</Option>
                  <Option value="Điện tử">Thiết bị điện tử</Option>
                  <Option value="Nội thất">Nội thất</Option>
                  <Option value="Khác">Khác</Option>
                </Select>
              </Form.Item>
            </Col>

            <Col span={8}>
              <Form.Item label="Đơn vị tính" name="unit" rules={[{ required: true }]}>
                <Input placeholder="Cái, Chiếc..." />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Số lượng tổng" name="totalQuantity" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item label="Nhà cung cấp" name="supplier">
                <Input placeholder="Tên công ty" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Giá nhập" name="importPrice" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} formatter={v => `₫ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Giá đền bù" name="compensationPrice" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} formatter={v => `₫ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </Card>
  );
};

export default WarehouseManagement;