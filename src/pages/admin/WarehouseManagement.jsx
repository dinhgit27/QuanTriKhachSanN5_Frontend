import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Table, Button, Space, Tag, Modal, Form, Input, 
  Select, message, Card, Typography, InputNumber, Upload, Row, Col, Popconfirm 
} from 'antd';
import { 
  PlusOutlined, EditOutlined, DeleteOutlined, 
  UploadOutlined, LoadingOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { auditLogger } from '../../utils/auditLogger';
import { useDamageEventStore } from '../../store/damageEventStore';
import { useEquipmentEventStore } from '../../store/equipmentEventStore';

const { Title, Text } = Typography;
const { Option } = Select;

const WarehouseManagement = () => {
  // Subscribe to global damage updates - real-time from store
  const lastDamageUpdate = useDamageEventStore((state) => state.lastDamageUpdate);
  
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [damagedCount, setDamagedCount] = useState({}); 
  
  const [imageUrl, setImageUrl] = useState('');
  const [uploading, setUploading] = useState(false);

  const [form] = Form.useForm();
  const lastKnownUpdateRef = useRef(0); 

  // --- FETCH DỮ LIỆU HỎNG/MẤT TỪ API ---
  const fetchDamagedCount = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5070/api/LossAndDamages', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const counted = {};
      let totalDamaged = 0;
      
      res.data.forEach(record => {
        if (record.status === 'Chưa đền bù' || !record.status) {
          // Enhanced matching: exact name from parsed description + room
          const nameMatch = record.description.match(/^(.*?) - (Phòng|P\.)\s*\w+/i);
          const equipmentName = nameMatch ? nameMatch[1].trim() : record.description;
          const key = equipmentName;
          if (!counted[key]) counted[key] = 0;
          counted[key] += record.quantity || 1;
          totalDamaged++;
        }
      });

      
      setDamagedCount(counted);
      return counted;
    } catch (err) {
      console.error('❌ Lỗi fetch dữ liệu hỏng/mất:', err);
      return {};
    }
  }, []);

  // --- 1. LẤY DỮ LIỆU TỪ BẢNG EQUIPMENTS ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      // ĐỔI API TỪ Amenities SANG Equipments
      const res = await axios.get('http://localhost:5070/api/Equipments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setData(res.data);
      fetchDamagedCount();
    } catch (err) {
      console.error(err);
      message.error("Lỗi khi tải dữ liệu kho (Kiểm tra xem đã tạo API EquipmentsController chưa)!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const saved = localStorage.getItem('damagedCount');
    if (saved) setDamagedCount(JSON.parse(saved));
    
    const interval = setInterval(() => { fetchDamagedCount(); }, 5000);
    
    const handleDamageStatusChange = () => { fetchDamagedCount(); };
    const unsubscribe = useDamageEventStore.subscribe(
      (state) => state.lastDamageUpdate,
      handleDamageStatusChange
    );
    
    return () => {
      clearInterval(interval);
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (lastDamageUpdate > 0 && lastDamageUpdate !== lastKnownUpdateRef.current) {
      lastKnownUpdateRef.current = lastDamageUpdate;
      fetchDamagedCount();
    }
  }, [lastDamageUpdate, fetchDamagedCount]);

  // --- 2. UPLOAD ẢNH LÊN CLOUDINARY ---
  const handleUploadCloudinary = async (options) => {
    const { file, onSuccess, onError } = options;
    setUploading(true);
    
    const CLOUDINARY_URL = 'https://api.cloudinary.com/v1_1/dqx8hqmcv/image/upload';
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
    const editValues = {
      ...record,
      compensationPrice: record.compensationPrice || record.defaultPriceIfLost || 0
    };
    form.setFieldsValue(editValues);
    setIsModalVisible(true);
  };


  // --- 5. LƯU DỮ LIỆU VÀO EQUIPMENTS ---
  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

      // Tự động tính toán InStock khi tạo mới
      const finalPayload = {
        ...values,
        inStockQuantity: editingItem ? editingItem.inStockQuantity : values.totalQuantity,
        inUseQuantity: editingItem ? editingItem.inUseQuantity : 0,
        damagedQuantity: editingItem ? editingItem.damagedQuantity : 0,
        isActive: true
      };

      if (editingItem) {
        await axios.put(`http://localhost:5070/api/Equipments/${editingItem.id}`, { ...editingItem, ...finalPayload }, { headers });
        
        auditLogger.success(`Đã cập nhật thông tin vật tư: ${values.name}`, {
          action: 'Sửa', actionType: 'UPDATE', module: 'Kho Vật Tư',
          objectName: values.name,
          oldValue: editingItem, newValue: values,
        });
      } else {
        await axios.post('http://localhost:5070/api/Equipments', finalPayload, { headers });
        
        auditLogger.success(`Đã nhập vật tư mới vào kho: ${values.name}`, {
          action: 'Thêm', actionType: 'CREATE', module: 'Kho Vật Tư',
          objectName: values.name,
          newValue: values,
        });
      }

      // Trigger global equipment update to sync with other pages
      useEquipmentEventStore.getState().triggerEquipmentUpdate();
      
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
      const deletingItem = data.find(item => item.id === id);
      const itemName = deletingItem?.name || 'Vật tư';
      
      await axios.delete(`http://localhost:5070/api/Equipments/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      auditLogger.success(`Đã xóa vật tư: ${itemName}`, {
        action: 'Xóa', actionType: 'DELETE', module: 'Kho Vật Tư',
        objectName: itemName,
        oldValue: deletingItem,
      });
      fetchData();
    } catch (err) {
      message.error("Lỗi khi xóa!");
    }
  };

  // CHỈNH SỬA CỘT MAP VỚI BẢNG EQUIPMENTS MỚI
  const columns = [
    { 
      title: 'Ảnh', 
      dataIndex: 'imageUrl', 
      key: 'imageUrl', 
      render: (img) => img ? <img src={img} alt="item" style={{ width: 45, height: 45, objectFit: 'cover', borderRadius: 6, border: '1px solid #f0f0f0' }} /> : <Tag>No Image</Tag>
    },
    { title: 'Mã VT', dataIndex: 'itemCode', key: 'itemCode', render: t => <Tag color="purple" style={{ fontWeight: 'bold' }}>{t}</Tag> },
    { title: 'Tên thiết bị/vật tư', dataIndex: 'name', key: 'name', render: t => <Text strong>{t}</Text> },
    { 
      title: 'Tổng kho', 
      dataIndex: 'totalQuantity', 
      key: 'totalQuantity',
      render: (q, record) => <Tag color="blue">{q} {record.unit}</Tag>
    },
    { 
      title: 'Đang dùng', 
      dataIndex: 'inUseQuantity', 
      key: 'inUseQuantity',
      render: (q, record) => <Tag color="orange">{q} {record.unit}</Tag>
    },
    { 
      title: 'Có thể cấp', 
      dataIndex: 'inStockQuantity', 
      key: 'inStockQuantity',
      render: (q, record) => (
        <b style={{ color: q > 0 ? '#52c41a' : '#f5222d' }}>
          {q} {record.unit}
        </b>
      )
    },
    { 
      title: 'Sự cố (Cảnh báo)', 
      dataIndex: 'damagedCount', 
      key: 'damagedCount',
      render: (_, record) => {
        let count = 0;
        Object.keys(damagedCount).forEach(key => {
          if (key === record.name || key.includes(record.name)) count += damagedCount[key];
        });

        return (
          <Tag color={count > 0 ? 'red' : 'default'} style={{ cursor: count > 0 ? 'pointer' : 'default' }}>
            {count} {count > 0 ? '⚠️' : '✓'}
          </Tag>
        );
      }
    },
    { title: 'Danh mục', dataIndex: 'category', key: 'category', render: c => <Tag color="geekblue">{c}</Tag> },
    { 
      title: 'Giá nhập', 
      dataIndex: 'basePrice', 
      key: 'basePrice',
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
          <Text type="secondary">Quản lý nhập xuất vật tư tổng trên hệ thống Cloudinary</Text>
        </div>
        <Space>
          <Button type="primary" size="large" icon={<PlusOutlined />} onClick={handleAddNew} style={{ borderRadius: 8, height: 45 }}>
            Nhập vật tư mới
          </Button>
        </Space>
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

            <Col span={8}>
              <Form.Item label="Mã vật tư" name="itemCode" rules={[{ required: true }]}>
                <Input placeholder="VD: VT001" />
              </Form.Item>
            </Col>
            <Col span={16}>
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

            <Col span={12}>
              <Form.Item label="Nhà cung cấp" name="supplier">
                <Input placeholder="Tên công ty" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Đơn vị tính" name="unit" rules={[{ required: true }]}>
                <Input placeholder="Cái, Chiếc..." />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Số lượng tổng" name="totalQuantity" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} min={0} />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item label="Giá nhập" name="basePrice" rules={[{ required: true }]}>
                <InputNumber style={{ width: '100%' }} formatter={v => `₫ ${v}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Giá đền bù (Nếu mất/hỏng)" name="compensationPrice" rules={[{ required: true }]}>  
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

