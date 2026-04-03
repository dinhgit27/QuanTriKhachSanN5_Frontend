import React, { useState, useEffect } from 'react';
import { Table, Button, Tag, Space, message, Typography, Popconfirm, Card } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import { useAuditLog } from '../../hooks/useAuditLog';
import { useDamageEventStore } from '../../store/damageEventStore';

const { Title, Text } = Typography;

const LossAndDamageManagement = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const { logAction } = useAuditLog();

  // --- 1. KÉO DỮ LIỆU TỪ SQL LÊN ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('https://localhost:5070/api/LossAndDamages', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Đảo ngược mảng để biên bản mới nhất lên đầu
      setData(res.data.reverse()); 
    } catch (error) {
      console.error("Lỗi fetch biên bản:", error);
      message.error("Không tải được danh sách biên bản đền bù!");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- 2. HÀM CẬP NHẬT TRẠNG THÁI (ĐÃ ĐỀN BÙ / HỦY) ---
  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      const currentRecord = data.find(item => item.id === id);
      
      // 🚨 BÍ KÍP C# ASP.NET: Gửi string [FromBody] phải bọc trong dấu ngoặc kép ""
      await axios.put(`https://localhost:5070/api/LossAndDamages/status/${id}`, 
        `"${newStatus}"`, 
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json' 
          }
        }
      );
      
      logAction({
        action: 'Cập nhật',
        actionType: 'UPDATE',
        module: 'Biên Bản Thiệt Hại',
        objectName: `Biên bản #${id}`,
        description: `Cập nhật trạng thái biên bản thành: ${newStatus}`,
        oldValue: { status: currentRecord?.status },
        newValue: { status: newStatus },
      });
      
      message.success(`Đã cập nhật trạng thái biên bản thành: ${newStatus}`);
      
      // Trigger global damage update - will notify all pages instantly
      console.log('📢 [LossAndDamage] Triggering global damage update');
      useDamageEventStore.getState().triggerDamageUpdate();
      
      fetchData(); // Bắt React load lại bảng để thấy sự thay đổi ngay lập tức
      
    } catch (error) {
      console.error(error);
      message.error("Lỗi cập nhật trạng thái! Vui lòng kiểm tra lại backend.");
    }
  };

  // --- 3. CỘT CỦA BẢNG ---
  const columns = [
    {
      title: 'Mã Biên Bản',
      dataIndex: 'id',
      key: 'id',
      align: 'center',
      render: (id) => <b>#DB{id}</b>
    },
    {
      title: 'Mô tả / Tên vật tư',
      dataIndex: 'description',
      key: 'description',
      render: (text) => <Text strong>{text || 'Chưa rõ'}</Text>
    },
    {
      title: 'Số lượng',
      dataIndex: 'quantity',
      key: 'quantity',
      align: 'center',
      render: (qty) => <Tag color="blue" style={{fontWeight: 'bold'}}>{qty}</Tag>
    },
    {
      title: 'Tiền phạt',
      dataIndex: 'penaltyAmount',
      key: 'penaltyAmount',
      render: (val) => <b style={{color: '#ff4d4f', fontSize: '15px'}}>{val ? val.toLocaleString('vi-VN') : 0} đ</b>
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      align: 'center',
      render: (status) => {
        let color = 'gold'; // Màu vàng cho Chưa xử lý / Chưa đền bù
        if (status === 'Đã đền bù') color = 'green';
        if (status === 'Đã hủy' || status === 'Hủy') color = 'red';
        return <Tag color={color} style={{ fontWeight: 'bold' }}>{status ? status.toUpperCase() : 'CHƯA XỬ LÝ'}</Tag>;
      }
    },
    {
      title: 'Thao tác (Lễ Tân)',
      key: 'action',
      align: 'center',
      render: (_, record) => {
        // Nếu đã xử lý xong (Đã thu tiền hoặc Đã hủy) thì khóa nút lại
        const isCompleted = record.status === 'Đã đền bù' || record.status === 'Đã hủy';
        
        return (
          <Space>
            <Popconfirm
              title="Khách đã thanh toán tiền phạt?"
              description="Hành động này sẽ chốt sổ biên bản."
              onConfirm={() => handleUpdateStatus(record.id, 'Đã đền bù')}
              disabled={isCompleted}
              okText="Xác nhận"
              cancelText="Không"
            >
              <Button 
                type="primary" 
                icon={<CheckCircleOutlined />} 
                disabled={isCompleted} 
                style={!isCompleted ? {backgroundColor: '#52c41a'} : {}}
              >
                Đã thu tiền
              </Button>
            </Popconfirm>

            <Popconfirm
              title="Bạn muốn hủy biên bản này?"
              description="Khách không cần đền bù cho mục này."
              onConfirm={() => handleUpdateStatus(record.id, 'Đã hủy')}
              disabled={isCompleted}
              okText="Hủy phạt"
              okType="danger"
              cancelText="Đóng"
            >
              <Button danger icon={<CloseCircleOutlined />} disabled={isCompleted}>
                Hủy Phạt
              </Button>
            </Popconfirm>
          </Space>
        );
      }
    }
  ];

  return (
    <div style={{ padding: '24px 32px', backgroundColor: '#f5f7fa', minHeight: '100vh' }}>
      <Card 
        bordered={false} 
        style={{ borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}
        styles={{ body: { padding: '24px' } }}
      >
        <Title level={3} style={{ marginTop: 0 }}>Biên Bản Thất Thoát & Đền Bù</Title>
        <Text type="secondary" style={{ display: 'block', marginBottom: 24, fontSize: '15px' }}>
          Nơi Lễ tân theo dõi và thu tiền phạt khi khách làm hỏng hoặc làm mất tài sản phòng.
        </Text>
        
        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          bordered
          pagination={{ pageSize: 8 }}
        />
      </Card>
    </div>
  );
};

export default LossAndDamageManagement;