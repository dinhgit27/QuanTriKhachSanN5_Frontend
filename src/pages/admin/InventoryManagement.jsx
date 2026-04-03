import React, { useState, useEffect } from 'react';
import { 
  Row, Col, Card, Badge, Modal, Table, Button, 
  Typography, message, Empty, Tag, Space, Spin 
} from 'antd';
import { 
  HomeOutlined, BuildOutlined, ExclamationCircleOutlined, ReloadOutlined,
  CheckCircleOutlined, SyncOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;

const RoomInventoryManagement = () => {
  const [rooms, setRooms] = useState([]); 
  const [loadingRooms, setLoadingRooms] = useState(false);
  
  const [selectedRoom, setSelectedRoom] = useState(null); 
  const [roomInventory, setRoomInventory] = useState([]); 
  const [isDetailVisible, setIsDetailVisible] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // --- LẤY DANH SÁCH PHÒNG ---
  const fetchRooms = async () => {
    setLoadingRooms(true);
    try {
      const token = localStorage.getItem('token'); 
      const res = await axios.get('https://localhost:5070/api/RoomInventory/rooms', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRooms(res.data);
    } catch (err) {
      console.error("Lỗi lấy phòng:", err);
      message.error("Không lấy được sơ đồ phòng. Vui lòng kiểm tra lại kết nối!");
    } finally {
      setLoadingRooms(false);
    }
  };

  // --- LẤY CHI TIẾT VẬT TƯ ---
  const fetchRoomInventoryDetails = async (roomId) => {
    setLoadingDetails(true);
    try {
      const token = localStorage.getItem('token');
      // Đã fix lỗi URL để lấy đúng đồ của 1 phòng (Không bị trùng lặp)
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
    fetchRooms();
  }, []);

  const handleRoomClick = (room) => {
    setSelectedRoom(room);
    setIsDetailVisible(true);
    fetchRoomInventoryDetails(room.id);
  };

  // --- HÀM XỬ LÝ BÁO HỎNG (GỌI API TẠO BIÊN BẢN ĐỀN BÙ) ---
  const handleReportDamage = (record) => {
    Modal.confirm({
      title: 'Xác nhận báo hỏng tài sản',
      content: (
        <div>
          Bạn xác nhận vật tư <b style={{color: 'red'}}>{record.amenity?.name}</b> ở phòng <b>{selectedRoom?.roomNumber}</b> đã bị hỏng?
          <br/><br/>
          <i>Hệ thống sẽ tự động cập nhật trạng thái và gửi 1 Biên bản sang bộ phận Lễ Tân.</i>
        </div>
      ),
      okText: 'Xác nhận Báo hỏng',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          const token = localStorage.getItem('token');
          
          // 1. CHỈNH SỬA PAYLOAD: Lấy giá tiền thật và Tên vật tư
          const damagePayload = {
             roomInventoryId: record.id, 
             bookingDetailId: 1, 
             quantity: 1, 
             // Lấy giá thật của vật tư (nếu Backend ko có thì để mặc định 500.000đ cho đẹp)
             penaltyAmount: record.amenity?.price || record.amenity?.importPrice || 500000, 
             // Đưa luôn Tên vật tư vào cột Mô tả để lát nữa qua trang Biên bản dễ hiển thị
             description: record.amenity?.name || 'Vật tư phòng', 
             status: 'Chưa đền bù'
          };

          await axios.post('https://localhost:5070/api/LossAndDamages', damagePayload, {
            headers: { Authorization: `Bearer ${token}` }
          });

          message.success(`Đã báo hỏng ${record.amenity?.name} thành công! Lễ tân đã nhận được biên bản.`);
          
          // 2. BÍ KÍP GIÚP NÚT CHUYỂN SANG MÀU XÁM NGAY LẬP TỨC:
          // Ép React đổi state nội bộ thành isActive = false
          setRoomInventory(prev => prev.map(item => 
              item.id === record.id ? { ...item, isActive: false } : item
          ));
          
        } catch (error) {
          console.error(error);
          message.error("Lỗi khi báo hỏng. Vui lòng kiểm tra lại Backend!");
        }
      }
    });
  };

  // --- HÀM CẤU HÌNH GIAO DIỆN TRẠNG THÁI PHÒNG ---
  const getStatusUI = (status) => {
    switch (status) {
      case 'Available': 
        return { text: 'Phòng Trống', color: '#52c41a', bgColor: '#f6ffed', borderColor: '#b7eb8f' };
      case 'Occupied': 
        return { text: 'Có Khách', color: '#ff4d4f', bgColor: '#fff2f0', borderColor: '#ffccc7' };
      case 'Cleaning': 
        return { text: 'Đang Dọn', color: '#1890ff', bgColor: '#e6f7ff', borderColor: '#91d5ff' };
      case 'Maintenance': 
        return { text: 'Bảo Trì', color: '#faad14', bgColor: '#fffbe6', borderColor: '#ffe58f' };
      default: 
        return { text: status || 'Chưa rõ', color: '#8c8c8c', bgColor: '#fafafa', borderColor: '#d9d9d9' };
    }
  };

  // --- CỘT THAO TÁC CỦA BẢNG TÀI SẢN ---
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
      title: 'Số lượng', 
      dataIndex: 'quantity', 
      key: 'quantity', 
      align: 'center',
      render: (qty) => <Tag color="geekblue" style={{ fontWeight: 'bold', fontSize: 14 }}>{qty}</Tag>
    },
    { 
      title: 'Tình trạng', 
      dataIndex: 'isActive', 
      key: 'isActive',
      render: (isActive) => (
        <Tag color={isActive ? 'success' : 'error'} style={{ borderRadius: 12 }}>
          {isActive ? 'Hoạt động tốt' : 'Hỏng/Cần thay'}
        </Tag>
      )
    },
    {
      title: 'Thao tác',
      key: 'action',
      align: 'center',
      render: (_, record) => {
        // LOGIC KHÓA NÚT TẠI ĐÂY
        const isDamaged = !record.isActive; 

        return (
          <Button 
            size="small" 
            type="primary" 
            danger 
            ghost={!isDamaged} 
            disabled={isDamaged} // Nếu isDamaged = true thì vô hiệu hóa nút
            icon={<ExclamationCircleOutlined />}
            onClick={() => handleReportDamage(record)}
          >
            {isDamaged ? 'Đã báo hỏng' : 'Báo hỏng'}
          </Button>
        );
      },
    },
  ];

  return (
    <div style={{ padding: '24px 32px', backgroundColor: '#f5f7fa', minHeight: '100vh' }}>
      
      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, paddingBottom: 16, borderBottom: '1px solid #e8e8e8' }}>
        <div>
          <Title level={3} style={{ margin: 0, color: '#1f1f1f' }}>Sơ Đồ Tài Sản Phòng</Title>
          <Text type="secondary" style={{ fontSize: 15 }}>Theo dõi và quản lý vật tư thiết bị từng phòng trong khách sạn</Text>
        </div>
        <Button type="primary" size="large" icon={loadingRooms ? <SyncOutlined spin /> : <ReloadOutlined />} onClick={fetchRooms} style={{ borderRadius: 8 }}>
          Làm mới sơ đồ
        </Button>
      </div>

      {/* SƠ ĐỒ LƯỚI PHÒNG */}
      <Spin spinning={loadingRooms} description="Đang tải dữ liệu phòng..." size="large">
        {rooms.length === 0 && !loadingRooms ? (
          <Empty description="Chưa có dữ liệu phòng nào!" style={{ marginTop: 50 }} />
        ) : (
          <Row gutter={[24, 24]}>
            {rooms.map(room => {
              const ui = getStatusUI(room.status);
              
              return (
                <Col xs={12} sm={12} md={8} lg={6} xl={4} key={room.id}>
                  <Badge.Ribbon text={ui.text} color={ui.color} placement="end">
                    <Card
                      hoverable
                      style={{ 
                        borderRadius: 16, 
                        textAlign: 'center', 
                        border: `1px solid ${ui.borderColor}`,
                        backgroundColor: '#ffffff',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                        transition: 'all 0.3s ease',
                      }}
                      styles={{ body: { padding: '28px 16px 20px 16px' } }}
                      onClick={() => handleRoomClick(room)}
                    >
                      <div style={{ 
                        width: 64, height: 64, margin: '0 auto 16px auto', 
                        backgroundColor: ui.bgColor, borderRadius: '50%', 
                        display: 'flex', justifyContent: 'center', alignItems: 'center'
                      }}>
                        <HomeOutlined style={{ fontSize: 32, color: ui.color }} />
                      </div>
                      
                      <Title level={4} style={{ margin: 0, color: '#262626' }}>P. {room.roomNumber}</Title>
                      <Text type="secondary" style={{ fontSize: 13, display: 'block', marginTop: 4 }}>
                        {room.roomTypeName || 'Chưa phân loại'}
                      </Text>
                    </Card>
                  </Badge.Ribbon>
                </Col>
              );
            })}
          </Row>
        )}
      </Spin>

      {/* MODAL CHI TIẾT TÀI SẢN */}
      <Modal
        title={
          <Space align="center">
            <div style={{ width: 40, height: 40, backgroundColor: '#e6f7ff', borderRadius: 8, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <BuildOutlined style={{ color: '#1890ff', fontSize: 20 }} />
            </div>
            <div>
              <div style={{ fontSize: 18, fontWeight: 'bold' }}>Danh sách tài sản</div>
              <div style={{ fontSize: 13, color: '#8c8c8c', fontWeight: 'normal' }}>Phòng {selectedRoom?.roomNumber} - {selectedRoom?.roomTypeName}</div>
            </div>
          </Space>
        }
        open={isDetailVisible}
        onCancel={() => setIsDetailVisible(false)}
        footer={[
          <Button key="close" type="primary" onClick={() => setIsDetailVisible(false)} style={{ borderRadius: 6 }}>
            Xác nhận & Đóng
          </Button>
        ]}
        width={800}
        destroyOnHidden
        centered
      >
        <div style={{ marginTop: 24 }}>
          <Spin spinning={loadingDetails}>
            <Table 
              columns={columns} 
              dataSource={roomInventory} 
              rowKey="id" 
              pagination={false}
              bordered
              locale={{ emptyText: <Empty description="Phòng này chưa được bố trí vật tư nào!" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
            />
          </Spin>
        </div>
      </Modal>
    </div>
  );
};

export default RoomInventoryManagement;