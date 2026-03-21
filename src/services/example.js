// Ví dụ sử dụng API service trong component

import React, { useState, useEffect } from 'react';
import { message, Table, Button, Space } from 'antd';
import { roomAPI } from '../services/api'; // Import từ file api.js

const RoomManagementExample = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);

  // Lấy danh sách phòng khi component mount
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

  const handleCreateRoom = async (roomData) => {
    try {
      await roomAPI.create(roomData);
      message.success('Tạo phòng thành công');
      fetchRooms(); // Refresh danh sách
    } catch (error) {
      message.error('Không thể tạo phòng');
      console.error('Error creating room:', error);
    }
  };

  const handleUpdateRoom = async (id, roomData) => {
    try {
      await roomAPI.update(id, roomData);
      message.success('Cập nhật phòng thành công');
      fetchRooms(); // Refresh danh sách
    } catch (error) {
      message.error('Không thể cập nhật phòng');
      console.error('Error updating room:', error);
    }
  };

  const handleDeleteRoom = async (id) => {
    try {
      await roomAPI.delete(id);
      message.success('Xóa phòng thành công');
      fetchRooms(); // Refresh danh sách
    } catch (error) {
      message.error('Không thể xóa phòng');
      console.error('Error deleting room:', error);
    }
  };

  const columns = [
    {
      title: 'Số Phòng',
      dataIndex: 'roomNumber',
      key: 'roomNumber',
    },
    {
      title: 'Loại Phòng',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Trạng Thái',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Hành Động',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button onClick={() => handleUpdateRoom(record.id, { ...record, status: 'available' })}>
            Cập Nhật
          </Button>
          <Button danger onClick={() => handleDeleteRoom(record.id)}>
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <h2>Quản Lý Phòng - Ví dụ sử dụng API Service</h2>
      <Table
        columns={columns}
        dataSource={rooms}
        loading={loading}
        rowKey="id"
      />
    </div>
  );
};

export default RoomManagementExample;