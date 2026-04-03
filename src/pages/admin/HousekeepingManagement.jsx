import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Badge, Modal, Table, Button, Typography, message, Spin, Empty, Tag, Space, Popconfirm } from 'antd';
import { ClearOutlined, CheckCircleOutlined, ExclamationCircleOutlined, SyncOutlined, BuildOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;

const HousekeepingManagement = () => {
  const [rooms, setRooms] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  
  // State cho Modal Kiểm tra vật tư
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [roomInventory, setRoomInventory] = useState([]);
  const [isInventoryVisible, setIsInventoryVisible] = useState(false);
  const [loadingInventory, setLoadingInventory] = useState(false);


  const fetchCleaningRooms = async () => {
    setLoadingRooms(true);
    try {
      const token = localStorage.getItem('token');
      
      // SỬA ĐƯỜNG LINK Ở ĐÂY: Lấy đúng API của trang Quản Lý Phòng (Thường là /api/Rooms)
      // Ní nhớ đối chiếu lại xem file RoomManagement.jsx xài link gì thì thay link đó vào nha!
      const res = await axios.get('https://localhost:5070/api/Rooms', { 
        headers: { Authorization: `Bearer ${token}` }
      });

      // LỌC THEO CỘT DỌN DẸP
      const cleaningRooms = res.data.filter(r => {
         // Cố gắng bắt mọi trạng thái liên quan đến việc dọn phòng
         return r.status === 'Cleaning' || 
                r.cleaningStatus === 'Inspecting' || 
                r.cleaningStatus === 'Cleaning';
      });

      setRooms(cleaningRooms);
    } catch (err) {
      message.error("Lỗi khi tải danh sách phòng cần dọn!");
    } finally {
      setLoadingRooms(false);
    }
  };


  useEffect(() => {
    fetchCleaningRooms();
  }, []);

  // 2. XỬ LÝ HOÀN TẤT DỌN PHÒNG (ĐỔI SANG AVAILABLE)
  const handleCompleteCleaning = async (roomId) => {
    try {
      const token = localStorage.getItem('token');
      
      // Gọi đúng API "mark-clean" vừa tạo ở C#
      await axios.put(`https://localhost:5070/api/RoomInventory/rooms/${roomId}/mark-clean`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      message.success('Đã xác nhận phòng sạch sẽ! Sẵn sàng đón khách.');
      fetchCleaningRooms(); // Load lại là bay màu ngay lập tức!
    } catch (error) {
      console.error(error);
      message.error("Lỗi khi cập nhật trạng thái phòng!");
    }
  };

  // 3. XỬ LÝ MỞ MODAL KIỂM TRA VẬT TƯ
  const handleCheckInventory = async (room) => {
    setSelectedRoom(room);
    setIsInventoryVisible(true);
    setLoadingInventory(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`https://localhost:5070/api/RoomInventory/rooms/${room.id}/inventory`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRoomInventory(res.data);
    } catch (err) {
      message.error("Lỗi tải danh sách vật tư!");
    } finally {
      setLoadingInventory(false);
    }
  };

  // 4. XỬ LÝ BÁO HỎNG (Y chang trang Inventory)
  const handleReportDamage = (record) => {
    Modal.confirm({
      title: 'Xác nhận báo hỏng / mất tài sản',
      content: <div>Bạn xác nhận vật tư <b style={{color: 'red'}}>{record.amenity?.name}</b> ở phòng <b>{selectedRoom?.roomNumber}</b> bị hỏng hoặc mất?</div>,
      okText: 'Báo hỏng ngay',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          const token = localStorage.getItem('token');
          const damagePayload = {
            roomInventoryId: record.id, 
            quantity: 1, 
            penaltyAmount: record.amenity?.price || record.amenity?.importPrice || 500000, 
            description: `Phòng ${selectedRoom?.roomNumber} - Khách check-out làm hỏng/mất ${record.amenity?.name}`, 
            status: 'Chưa đền bù'
          };

          await axios.post('https://localhost:5070/api/LossAndDamages', damagePayload, {
            headers: { Authorization: `Bearer ${token}` }
          });
          message.success(`Đã lập biên bản báo hỏng ${record.amenity?.name}! Lễ tân đã nhận được thông báo.`);
          
          setRoomInventory(prev => prev.map(item => 
              item.id === record.id ? { ...item, isActive: false } : item
          ));
        } catch (error) {
          message.error("Lỗi báo hỏng!");
        }
      }
    });
  };

  // Cột cho bảng kiểm tra vật tư
  const columns = [
    { 
      title: 'Tên Vật Tư', 
      key: 'amenityName', 
      render: (_, record) => (
        <Space>
          {record.isActive ? <CheckCircleOutlined style={{ color: '#52c41a' }} /> : <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />}
          <b style={{ color: record.isActive ? '#262626' : '#8c8c8c', textDecoration: record.isActive ? 'none' : 'line-through' }}>
            {record.amenity?.name}
          </b>
        </Space>
      ) 
    },
    { 
      title: 'Số lượng', dataIndex: 'quantity', key: 'quantity', align: 'center',
      render: (qty) => <Tag color="blue">{qty}</Tag>
    },
    {
      title: 'Thao tác Kiểm tra', key: 'action', align: 'center',
      render: (_, record) => {
        const isDamaged = !record.isActive; 
        return (
          <Button size="small" type="primary" danger disabled={isDamaged} onClick={() => handleReportDamage(record)}>
            {isDamaged ? 'Đã báo hỏng' : 'Báo hỏng / Mất'}
          </Button>
        );
      },
    },
  ];

  return (
    <div style={{ padding: '24px 32px', backgroundColor: '#f5f7fa', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, paddingBottom: 16, borderBottom: '1px solid #e8e8e8' }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#1f1f1f' }}>Nhiệm Vụ Dọn Phòng</Title>
          <Text type="secondary">Danh sách các phòng khách vừa Check-out cần kiểm tra đồ đạc và dọn dẹp</Text>
        </div>
        <Button icon={<SyncOutlined />} onClick={fetchCleaningRooms} type="primary" ghost>Làm mới</Button>
      </div>

      <Spin spinning={loadingRooms}>
        {rooms.length === 0 ? (
          <Empty description="Tuyệt vời! Hiện tại không có phòng nào cần dọn." style={{ marginTop: 100 }} />
        ) : (
          <Row gutter={[24, 24]}>
            {rooms.map(room => (
              <Col xs={24} sm={12} md={8} lg={6} key={room.id}>
                <Badge.Ribbon text="Đang Dọn" color="#1890ff">
                  <Card hoverable style={{ borderRadius: 16, border: '1px solid #91d5ff' }}>
                    <div style={{ textAlign: 'center', marginBottom: 20 }}>
                      <ClearOutlined style={{ fontSize: 40, color: '#1890ff', marginBottom: 10 }} />
                      <Title level={4} style={{ margin: 0 }}>Phòng {room.roomNumber}</Title>
                      <Text type="secondary">{room.roomTypeName}</Text>
                    </div>
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <Button type="default" block icon={<BuildOutlined />} onClick={() => handleCheckInventory(room)}>
                        Kiểm tra đồ đạc
                      </Button>
                      
                      <Popconfirm 
                        title="Xác nhận phòng đã sạch?" 
                        description="Phòng sẽ được chuyển sang trạng thái Sẵn sàng bán."
                        onConfirm={() => handleCompleteCleaning(room.id)} 
                        okText="Xác nhận" cancelText="Chưa xong"
                      >
                        <Button type="primary" block style={{ backgroundColor: '#52c41a' }} icon={<CheckCircleOutlined />}>
                          Hoàn tất sạch sẽ
                        </Button>
                      </Popconfirm>
                    </div>
                  </Card>
                </Badge.Ribbon>
              </Col>
            ))}
          </Row>
        )}
      </Spin>

      {/* MODAL KIỂM TRA ĐỒ ĐẠC */}
      <Modal
        title={`Kiểm tra tài sản - Phòng ${selectedRoom?.roomNumber}`}
        open={isInventoryVisible}
        onCancel={() => setIsInventoryVisible(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setIsInventoryVisible(false)}>Đã kiểm tra xong</Button>
        ]}
        width={700}
      >
        <Spin spinning={loadingInventory}>
          <div style={{ marginBottom: 16 }}>
            <Text type="danger">Lưu ý: Báo hỏng ngay lập tức nếu phát hiện thiếu sót để Lễ tân thu tiền khách!</Text>
          </div>
          <Table columns={columns} dataSource={roomInventory} rowKey="id" pagination={false} bordered />
        </Spin>
      </Modal>
    </div>
  );
};

export default HousekeepingManagement;