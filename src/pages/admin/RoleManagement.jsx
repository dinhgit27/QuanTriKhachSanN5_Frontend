import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Modal, Checkbox, Row, Col, message, Typography } from 'antd';
import { SafetyCertificateOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;

const RoleManagement = () => {
  const [roles, setRoles] = useState([]);
  const [allPermissions, setAllPermissions] = useState([]);
  const [loading, setLoading] = useState(false);

  // State cho Modal Phân quyền
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [checkedList, setCheckedList] = useState([]); // Chứa ID các quyền được tick

  // Lấy dữ liệu khi vào trang
  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // Gọi 2 API cùng lúc: Lấy Roles và Lấy danh sách Permissions
      const [rolesRes, permsRes] = await Promise.all([
        axios.get('https://localhost:5070/api/Roles', { headers }),
        axios.get('https://localhost:5070/api/Roles/permissions', { headers })
      ]);

      setRoles(rolesRes.data);
      setAllPermissions(permsRes.data);
    } catch (error) {
      message.error('Lỗi khi tải dữ liệu phân quyền!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // Mở Modal và lấy quyền hiện tại của Role đó
  const handleOpenAssign = async (role) => {
    setSelectedRole(role);
    try {
      const token = localStorage.getItem('token');
      // Gọi API lấy các quyền mà Role này đang có
      const res = await axios.get(`https://localhost:5070/api/Roles/${role.id}/permissions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setCheckedList(res.data); // Mảng các ID quyền: [1, 3, 5...]
      setIsModalOpen(true);
    } catch (error) {
      message.error('Không tải được quyền của vai trò này!');
    }
  };

  // Lưu phân quyền
  const handleSavePermissions = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`https://localhost:5070/api/Roles/${selectedRole.id}/permissions`, checkedList, {
        headers: { Authorization: `Bearer ${token}` }
      });
      message.success(`Đã phân quyền thành công cho ${selectedRole.name}!`);
      setIsModalOpen(false);
    } catch (error) {
      message.error('Lỗi khi lưu phân quyền!');
    }
  };

  // Xử lý khi tick/untick checkbox
  const onChangeCheckbox = (list) => {
    setCheckedList(list);
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', render: id => <Text type="secondary">#ROL-{id}</Text> },
    { title: 'TÊN VAI TRÒ', dataIndex: 'name', render: text => <b>{text}</b> },
    { title: 'MÔ TẢ', dataIndex: 'description' },
    {
      title: 'THAO TÁC',
      align: 'right',
      render: (_, record) => (
        <Button 
          type="primary" 
          icon={<SafetyCertificateOutlined />}
          style={{ backgroundColor: '#2f54eb', borderRadius: 6 }}
          onClick={() => handleOpenAssign(record)}
        >
          PHÂN QUYỀN
        </Button>
      )
    }
  ];

  return (
    <Card style={{ borderRadius: 12, minHeight: '80vh' }} bodyStyle={{ padding: '24px' }}>
      <Title level={4}>Quản lý Vai trò & Phân quyền</Title>
      <Text type="secondary">Thiết lập quyền truy cập cho từng chức năng trong hệ thống.</Text>
      
      <Table 
        columns={columns} 
        dataSource={roles} 
        rowKey="id" 
        loading={loading} 
        style={{ marginTop: 24 }}
        pagination={false}
      />

      <Modal
        title={
          <div style={{ paddingBottom: 10, borderBottom: '1px solid #f0f0f0' }}>
            <Title level={4} style={{ margin: 0 }}>Phân quyền cho: <span style={{ color: '#2f54eb' }}>{selectedRole?.name}</span></Title>
            <Text type="secondary" style={{ fontSize: 13 }}>Vui lòng tick chọn các chức năng mà vai trò này được phép truy cập</Text>
          </div>
        }
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        width={700}
        footer={[
          <Button key="back" onClick={() => setIsModalOpen(false)}>Hủy</Button>,
          <Button key="submit" type="primary" style={{ backgroundColor: '#2f54eb' }} onClick={handleSavePermissions}>
            Lưu thay đổi
          </Button>
        ]}
      >
        <div style={{ padding: '20px 0' }}>
          <Checkbox.Group style={{ width: '100%' }} value={checkedList} onChange={onChangeCheckbox}>
            <Row gutter={[16, 24]}>
              {allPermissions.map((perm) => (
                <Col span={8} key={perm.id}>
                  <Checkbox value={perm.id}>
                    <Text strong style={{ fontSize: 13 }}>{perm.name}</Text>
                  </Checkbox>
                </Col>
              ))}
            </Row>
          </Checkbox.Group>
        </div>
      </Modal>
    </Card>
  );
};

export default RoleManagement;
