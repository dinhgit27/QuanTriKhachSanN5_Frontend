import React, { useState, useEffect } from 'react';
import { 
  Row, Col, Card, Badge, Modal, Table, Button, 
  Typography, message, Empty, Tag, Space, Spin, Form, Select, InputNumber, Popconfirm, Divider
} from 'antd';
import { 
  HomeOutlined, BuildOutlined, ExclamationCircleOutlined, ReloadOutlined,
  CheckCircleOutlined, SyncOutlined, PlusOutlined, DeleteOutlined, FilterOutlined
} from '@ant-design/icons';
import axios from 'axios';
import { useAuditLog } from '../../hooks/useAuditLog';
import { useDamageEventStore } from '../../store/damageEventStore';

const { Title, Text } = Typography;
const { Option } = Select;

const RoomInventoryManagement = () => {
  const { logAction } = useAuditLog();
  
  const [rooms, setRooms] = useState([]); 
  const [loadingRooms, setLoadingRooms] = useState(false);
  
  const [selectedRoom, setSelectedRoom] = useState(null); 
  const [roomInventory, setRoomInventory] = useState([]); 
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // --- STATE CHO TÍNH NĂNG THÊM VẬT TƯ ---
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [amenitiesList, setAmenitiesList] = useState([]);
  const [form] = Form.useForm();

  // --- STATE CHO BỘ LỌC (FILTERS) ---
  const [selectedFloor, setSelectedFloor] = useState('all');
  const [selectedRoomType, setSelectedRoomType] = useState('all');

  // --- LẤY DANH SÁCH PHÒNG & DANH SÁCH VẬT TƯ TRONG KHO ---
  const fetchData = async () => {
    setLoadingRooms(true);
    try {
      const token = localStorage.getItem('token'); 
      const headers = { Authorization: `Bearer ${token}` };

      const resRooms = await axios.get('https://localhost:5070/api/RoomInventory/rooms', { headers });
      setRooms(resRooms.data);

      const resAmenities = await axios.get('https://localhost:5070/api/RoomInventory/amenities', { headers });
      setAmenitiesList(resAmenities.data);
    } catch (err) {
      console.error("Lỗi lấy dữ liệu:", err);
      message.error("Lỗi kết nối máy chủ. Vui lòng thử lại!");
    } finally {
      setLoadingRooms(false);
    }
  };

  const fetchRoomInventoryDetails = async (roomId) => {
    setLoadingDetails(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`https://localhost:5070/api/RoomInventory/rooms/${roomId}/inventory`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRoomInventory(res.data);
    } catch (err) {
      message.error("Lỗi khi lấy chi tiết vật tư của phòng này!");
    } finally {
      setLoadingDetails(false);
    }
  };

  useEffect(() => {
    fetchData();
    
    // Listen for damage status changes from other pages
    const handleDamageStatusChange = () => {
      console.log('🔄 [InventoryManagement] Detected global damage update - refreshing inventory if room selected');
      if (selectedRoom) {
        fetchRoomInventoryDetails(selectedRoom.id);
      }
    };
    
    // Subscribe to global damage event store - works even if component unmounts elsewhere
    const unsubscribe = useDamageEventStore.subscribe(
      (state) => state.lastDamageUpdate,
      handleDamageStatusChange
    );
    
    return () => {
      unsubscribe();
    };
  }, [selectedRoom]);

  const handleRoomClick = (room) => {
    setSelectedRoom(room);
    setIsDetailVisible(true);
    fetchRoomInventoryDetails(room.id);
  };

  const handleAddInventory = async (values) => {
    try {
      const token = localStorage.getItem('token');
      const payload = {
        roomId: selectedRoom.id,
        amenityId: values.amenityId,
        quantity: values.quantity,
        isActive: true
      };

      const amenity = amenitiesList.find(a => a.id === values.amenityId);
      const amenityName = amenity?.name || 'Vật tư';

      await axios.post(`https://localhost:5070/api/RoomInventory/rooms/${selectedRoom.id}/inventory`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      logAction({
        action: 'Thêm',
        actionType: 'CREATE',
        module: 'Vật Tư Theo Phòng',
        objectName: `${amenityName} - Phòng ${selectedRoom?.roomNumber}`,
        description: `Cấp phát ${values.quantity} chiếc ${amenityName} vào phòng`,
        newValue: { amenityName, quantity: values.quantity, roomNumber: selectedRoom?.roomNumber },
      });

      message.success('Đã cấp phát vật tư vào phòng thành công!');
      setIsAddModalVisible(false);
      form.resetFields();
      fetchRoomInventoryDetails(selectedRoom.id);
    } catch (error) {
      message.error("Có lỗi xảy ra khi thêm vật tư!");
    }
  };

  const handleDeleteInventory = async (inventoryId) => {
    try {
      const token = localStorage.getItem('token');
      const deletingItem = roomInventory.find(item => item.id === inventoryId);
      const amenityName = deletingItem?.amenityName || 'Vật tư';
      const quantity = deletingItem?.quantity || 0;
      
      await axios.delete(`https://localhost:5070/api/RoomInventory/${inventoryId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      logAction({
        action: 'Xóa',
        actionType: 'DELETE',
        module: 'Vật Tư Theo Phòng',
        objectName: `${amenityName} - Phòng ${selectedRoom?.roomNumber}`,
        description: `Thu hồi ${quantity} chiếc ${amenityName} từ phòng`,
        oldValue: { amenityName, quantity, roomNumber: selectedRoom?.roomNumber },
      });
      
      message.success('Đã thu hồi vật tư thành công!');
      fetchRoomInventoryDetails(selectedRoom.id);
    } catch (error) {
      message.error("Lỗi khi xóa vật tư!");
    }
  };

  const handleReportDamage = (record) => {
    Modal.confirm({
      title: 'Xác nhận báo hỏng tài sản',
      content: <div>Bạn xác nhận vật tư <b style={{color: 'red'}}>{record.amenity?.name}</b> ở phòng <b>{selectedRoom?.roomNumber}</b> đã bị hỏng?</div>,
      okText: 'Xác nhận Báo hỏng',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          const token = localStorage.getItem('token');
          const damagePayload = {
            roomInventoryId: record.id, 
            quantity: 1, 
            penaltyAmount: record.amenity?.price || record.amenity?.importPrice || 500000, 
            description: `Phòng ${selectedRoom?.roomNumber} - ${record.amenity?.name}`, 
            status: 'Chưa đền bù'
          };

          await axios.post('https://localhost:5070/api/LossAndDamages', damagePayload, {
            headers: { Authorization: `Bearer ${token}` }
          });
          
          logAction({
            action: 'Báo hỏng',
            actionType: 'UPDATE',
            module: 'Vật Tư Theo Phòng',
            objectName: `${record.amenity?.name} - Phòng ${selectedRoom?.roomNumber}`,
            description: `Báo hỏng vật tư: ${record.amenity?.name}`,
            oldValue: { isActive: true },
            newValue: { isActive: false },
          });
          
          message.success(`Đã báo hỏng ${record.amenity?.name} thành công!`);
          
          // Trigger global damage update - will notify all pages instantly
          console.log('📢 [InventoryManagement] Triggering global damage update (báo hỏng)');
          useDamageEventStore.getState().triggerDamageUpdate();
          
          // Cập nhật state thành false (Đã hỏng)
          setRoomInventory(prev => prev.map(item => 
              item.id === record.id ? { ...item, isActive: false } : item
          ));
        } catch (error) {
          message.error("Lỗi báo hỏng!");
        }
      }
    });
  };

  const handleRestoreInventory = async (inventoryId) => {
    try {
      const token = localStorage.getItem('token');
      const restoringItem = roomInventory.find(item => item.id === inventoryId);
      
      console.log('🔧 [InventoryManagement] Starting restore process for:', restoringItem?.amenity?.name);
      
      // 1. GỌI API LƯU TRẠNG THÁI XUỐNG DATABASE
      await axios.put(`https://localhost:5070/api/RoomInventory/restore/${inventoryId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ [InventoryManagement] Room inventory restored');

      // 2. TÌM VÀ CẬP NHẬT LossAndDamages RECORD TƯƠNG ỨNG
      console.log('🔍 [InventoryManagement] Looking for LossAndDamages record with description:', `Phòng ${selectedRoom?.roomNumber} - ${restoringItem?.amenity?.name}`);
      try {
        const lossAndDamagesRes = await axios.get('https://localhost:5070/api/LossAndDamages', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        console.log('📦 [InventoryManagement] LossAndDamages response sample:', lossAndDamagesRes.data[0]);
        
        const targetDescription = `Phòng ${selectedRoom?.roomNumber} - ${restoringItem?.amenity?.name}`;
        const matchingRecords = lossAndDamagesRes.data.filter(
          record => record.description === targetDescription && record.status === 'Chưa đền bù'
        );
        
        console.log('📋 [InventoryManagement] Found matching records:', matchingRecords.length);
        
        if (matchingRecords.length > 0) {
          // Update ALL matching records (in case there are duplicates)
          for (const record of matchingRecords) {
            console.log('🔄 [InventoryManagement] Updating LossAndDamages record ID:', record.id);
            
            try {
              const updateRes = await axios.put(
                `https://localhost:5070/api/LossAndDamages/status/${record.id}`,
                { status: 'Đã hủy' },
                { headers: { Authorization: `Bearer ${token}` } }
              );
              
              console.log('✅ [InventoryManagement] LossAndDamages record', record.id, 'updated to "Đã hủy"');
            } catch (updateErr) {
              console.error('❌ [InventoryManagement] Error updating record', record.id, ':', updateErr.response?.data || updateErr.message);
            }
          }
        } else {
          console.log('⚠️ [InventoryManagement] No matching LossAndDamages records found for:', targetDescription);
        }
      } catch (err) {
        console.error('⚠️ [InventoryManagement] Error fetching LossAndDamages:', err);
        // Continue anyway - restoration of room inventory is done
      }

      logAction({
        action: 'Đã thay mới',
        actionType: 'UPDATE',
        module: 'Vật Tư Theo Phòng',
        objectName: `${restoringItem?.amenity?.name} - Phòng ${selectedRoom?.roomNumber}`,
        description: `Đã thay mới/sửa chữa vật tư: ${restoringItem?.amenity?.name}`,
        oldValue: { isActive: false },
        newValue: { isActive: true },
      });

      // 3. NẾU API THÀNH CÔNG THÌ MỚI ĐỔI MÀU GIAO DIỆN
      message.success('Đã xác nhận thay mới/sửa chữa vật tư thành công!');
      
      // Trigger global damage update - will notify all pages instantly
      console.log('📢 [InventoryManagement] Triggering global damage update (đã thay mới)');
      useDamageEventStore.getState().triggerDamageUpdate();
      
      setRoomInventory(prev => prev.map(item => 
          item.id === inventoryId ? { ...item, isActive: true } : item
      ));
    } catch (error) {
      message.error("Lỗi khi cập nhật trạng thái!");
    }
  };

  const getStatusUI = (status) => {
    switch (status) {
      case 'Available': return { text: 'Phòng Trống', color: '#52c41a', bgColor: '#f6ffed', borderColor: '#b7eb8f' };
      case 'Occupied': return { text: 'Có Khách', color: '#ff4d4f', bgColor: '#fff2f0', borderColor: '#ffccc7' };
      case 'Cleaning': return { text: 'Đang Dọn', color: '#1890ff', bgColor: '#e6f7ff', borderColor: '#91d5ff' };
      case 'Maintenance': return { text: 'Bảo Trì', color: '#faad14', bgColor: '#fffbe6', borderColor: '#ffe58f' };
      default: return { text: status || 'Chưa rõ', color: '#8c8c8c', bgColor: '#fafafa', borderColor: '#d9d9d9' };
    }
  };

  // =========================================================================
  // LOGIC BỘ LỌC TỰ ĐỘNG QUÉT DỮ LIỆU
  // =========================================================================

  // 1. Tự động gom các Tầng hiện có
  const floorOptions = [...new Set(rooms.map(room => {
    if (room.floor) return `Tầng ${room.floor}`;
    const firstChar = String(room.roomNumber).charAt(0);
    if (!isNaN(firstChar)) return `Tầng ${firstChar}`;
    if (String(room.roomNumber).toUpperCase().includes('VILLA')) return "Khu Villa";
    return "Khu Vực Khác";
  }))].sort();

  // 2. Tự động gom các Loại Phòng hiện có
  const roomTypeOptions = [...new Set(rooms.map(room => room.roomTypeName).filter(Boolean))].sort();

  // 3. Tiến hành lọc data trước khi render
  const filteredRooms = rooms.filter(room => {
    // Tìm nhãn Tầng của phòng này để so sánh
    let floorLabel = "Khu Vực Khác";
    if (room.floor) floorLabel = `Tầng ${room.floor}`;
    else if (room.roomNumber) {
      const firstChar = String(room.roomNumber).charAt(0);
      if (!isNaN(firstChar)) floorLabel = `Tầng ${firstChar}`;
      else if (String(room.roomNumber).toUpperCase().includes('VILLA')) floorLabel = "Khu Villa";
    }

    const matchFloor = selectedFloor === 'all' || floorLabel === selectedFloor;
    const matchRoomType = selectedRoomType === 'all' || room.roomTypeName === selectedRoomType;

    return matchFloor && matchRoomType;
  });

  const columns = [
    { 
      title: 'Tên Vật Tư', 
      key: 'amenityName', 
      render: (_, record) => (
        <Space>
          {record.isActive ? <CheckCircleOutlined style={{ color: '#52c41a' }} /> : <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />}
          <b style={{ color: '#262626' }}>{record.amenity?.name || 'Không xác định'}</b>
        </Space>
      ) 
    },
    { 
      title: 'Số lượng', dataIndex: 'quantity', key: 'quantity', align: 'center',
      render: (qty) => <Tag color="geekblue" style={{ fontWeight: 'bold', fontSize: 14 }}>{qty}</Tag>
    },
    { 
      title: 'Tình trạng', dataIndex: 'isActive', key: 'isActive',
      render: (isActive) => (
        <Tag color={isActive ? 'success' : 'error'} style={{ borderRadius: 12 }}>{isActive ? 'Hoạt động tốt' : 'Hỏng/Cần thay'}</Tag>
      )
    },
    {
      title: 'Thao tác', key: 'action', align: 'center',
      render: (_, record) => {
        const isDamaged = !record.isActive; 
        return (
          <Space>
            {isDamaged ? (
              <Button size="small" type="primary" style={{backgroundColor: '#52c41a'}} icon={<CheckCircleOutlined />} onClick={() => handleRestoreInventory(record.id)}>
                Đã thay mới
              </Button>
            ) : (
              <Button size="small" type="primary" danger ghost icon={<ExclamationCircleOutlined />} onClick={() => handleReportDamage(record)}>
                Báo hỏng
              </Button>
            )}
            <Popconfirm title="Xóa vật tư này khỏi phòng?" onConfirm={() => handleDeleteInventory(record.id)} okText="Xóa" cancelText="Hủy">
              <Button size="small" type="text" danger icon={<DeleteOutlined />} />
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  return (
    <div style={{ padding: '24px 32px', backgroundColor: '#f5f7fa', minHeight: '100vh' }}>
      {/* HEADER BAR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid #e8e8e8' }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#1f1f1f' }}>Sơ Đồ Tài Sản Phòng</Title>
          <Text type="secondary" style={{ fontSize: 15 }}>Theo dõi và quản lý vật tư thiết bị từng phòng trong khách sạn</Text>
        </div>
        <Button type="primary" size="large" icon={loadingRooms ? <SyncOutlined spin /> : <ReloadOutlined />} onClick={fetchData} style={{ borderRadius: 8 }}>
          Làm mới sơ đồ
        </Button>
      </div>

      {/* FILTER BAR - THANH BỘ LỌC CỰC XỊN */}
      <div style={{ marginBottom: 32, padding: '16px 24px', backgroundColor: '#ffffff', borderRadius: 12, border: '1px solid #e8e8e8', display: 'flex', alignItems: 'center', gap: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FilterOutlined style={{ color: '#1890ff', fontSize: 18 }} />
          <Text strong style={{ fontSize: 15 }}>Bộ lọc:</Text>
        </div>
        
        <Space size="large" wrap>
          <div>
            <Text type="secondary" style={{ marginRight: 8 }}>Theo Tầng:</Text>
            <Select 
              value={selectedFloor} 
              onChange={setSelectedFloor} 
              style={{ width: 160 }}
              options={[
                { value: 'all', label: 'Tất cả các tầng' },
                ...floorOptions.map(f => ({ value: f, label: f }))
              ]}
            />
          </div>
          <div>
            <Text type="secondary" style={{ marginRight: 8 }}>Loại phòng:</Text>
            <Select 
              value={selectedRoomType} 
              onChange={setSelectedRoomType} 
              style={{ width: 280 }}
              showSearch
              options={[
                { value: 'all', label: 'Tất cả loại phòng' },
                ...roomTypeOptions.map(t => ({ value: t, label: t }))
              ]}
            />
          </div>
          
          {(selectedFloor !== 'all' || selectedRoomType !== 'all') && (
            <Button type="link" danger onClick={() => { setSelectedFloor('all'); setSelectedRoomType('all'); }}>
              Xóa bộ lọc
            </Button>
          )}
        </Space>
      </div>

      <Spin spinning={loadingRooms} description="Đang tải dữ liệu phòng..." size="large">
        {filteredRooms.length === 0 && !loadingRooms ? (
          <Empty description="Không tìm thấy phòng nào phù hợp với bộ lọc!" style={{ marginTop: 50 }} />
        ) : (
          (() => {
            // Gom nhóm những phòng ĐÃ LỌC
            const groupedRooms = filteredRooms.reduce((acc, room) => {
              let floorLabel = "Khu Vực Khác";
              
              if (room.floor) {
                floorLabel = `Tầng ${room.floor}`;
              } else if (room.roomNumber) {
                const firstChar = String(room.roomNumber).charAt(0);
                if (!isNaN(firstChar)) {
                  floorLabel = `Tầng ${firstChar}`;
                } else if (String(room.roomNumber).toUpperCase().includes('VILLA')) {
                  floorLabel = "Khu Villa";
                }
              }

              if (!acc[floorLabel]) acc[floorLabel] = [];
              acc[floorLabel].push(room);
              return acc;
            }, {});

            return Object.keys(groupedRooms).sort().map(floor => (
              <div key={floor} style={{ marginBottom: 40 }}>
                <Divider orientation="left" style={{ borderColor: '#d9d9d9' }}>
                  <Title level={4} style={{ margin: 0, color: '#1890ff', textTransform: 'uppercase' }}>
                    {floor} <span style={{fontSize: 14, color: '#8c8c8c', fontWeight: 'normal'}}>({groupedRooms[floor].length} phòng)</span>
                  </Title>
                </Divider>
                
                <Row gutter={[24, 24]}>
                  {groupedRooms[floor].map(room => {
                    const ui = getStatusUI(room.status);
                    return (
                      <Col xs={12} sm={12} md={8} lg={6} xl={4} key={room.id}>
                        <Badge.Ribbon text={ui.text} color={ui.color} placement="end">
                          <Card hoverable style={{ borderRadius: 16, textAlign: 'center', border: `1px solid ${ui.borderColor}` }} styles={{ body: { padding: '28px 16px 20px 16px' } }} onClick={() => handleRoomClick(room)}>
                            <div style={{ width: 64, height: 64, margin: '0 auto 16px auto', backgroundColor: ui.bgColor, borderRadius: '50%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                              <HomeOutlined style={{ fontSize: 32, color: ui.color }} />
                            </div>
                            <Title level={4} style={{ margin: 0, color: '#262626' }}>P. {room.roomNumber}</Title>
                            <Text type="secondary" style={{ fontSize: 13, display: 'block', marginTop: 4 }}>{room.roomTypeName || 'Chưa phân loại'}</Text>
                          </Card>
                        </Badge.Ribbon>
                      </Col>
                    );
                  })}
                </Row>
              </div>
            ));
          })()
        )}
      </Spin>

      {/* MODAL CHI TIẾT TÀI SẢN PHÒNG */}
      <Modal
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <Space align="center">
              <div style={{ width: 40, height: 40, backgroundColor: '#e6f7ff', borderRadius: 8, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <BuildOutlined style={{ color: '#1890ff', fontSize: 20 }} />
              </div>
              <div>
                <div style={{ fontSize: 18, fontWeight: 'bold' }}>Danh sách tài sản - P.{selectedRoom?.roomNumber}</div>
              </div>
            </Space>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsAddModalVisible(true)} style={{ marginRight: 24, borderRadius: 6 }}>
              Thêm Vật Tư
            </Button>
          </div>
        }
        open={isDetailVisible}
        onCancel={() => setIsDetailVisible(false)}
        footer={null}
        width={850}
        destroyOnHidden
        centered
      >
        <div style={{ marginTop: 24 }}>
          <Spin spinning={loadingDetails}>
            <Table columns={columns} dataSource={roomInventory} rowKey="id" pagination={false} bordered locale={{ emptyText: <Empty description="Phòng này chưa được bố trí vật tư nào!" /> }} />
          </Spin>
        </div>
      </Modal>

      {/* MODAL NHỎ: FORM THÊM VẬT TƯ VÀO PHÒNG */}
      <Modal
        title="Cấp phát vật tư cho phòng"
        open={isAddModalVisible}
        onCancel={() => { setIsAddModalVisible(false); form.resetFields(); }}
        footer={null}
        centered
        width={400}
      >
        <Form form={form} layout="vertical" onFinish={handleAddInventory} style={{ marginTop: 16 }}>
          <Form.Item name="amenityId" label="Chọn vật tư từ Kho" rules={[{ required: true, message: 'Vui lòng chọn vật tư!' }]}>
            <Select placeholder="-- Chọn vật tư --" showSearch optionFilterProp="label" 
              options={amenitiesList.map(item => ({ value: item.id, label: item.name }))}
            />
          </Form.Item>

          <Form.Item name="quantity" label="Số lượng" rules={[{ required: true, message: 'Nhập số lượng!' }]} initialValue={1}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>

          <Button type="primary" htmlType="submit" block size="large" style={{ marginTop: 10, borderRadius: 6 }}>
            Xác nhận cấp phát
          </Button>
        </Form>
      </Modal>
    </div>
  );
};

export default RoomInventoryManagement;