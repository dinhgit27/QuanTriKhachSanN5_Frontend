import React, { useState } from 'react';

const RoomMap = () => {
  
  const [rooms, setRooms] = useState([
    { id: 101, type: 'Single', status: 'available' },
    { id: 102, type: 'Double', status: 'occupied' },
    { id: 103, type: 'Suite', status: 'cleaning' },
    { id: 104, type: 'Double', status: 'available' },
  ]);

  const getStatusColor = (status) => {
    switch (status) {
      case 'available': return 'bg-green-500'; // Phòng trống - Xanh
      case 'occupied': return 'bg-red-500';    // Có khách - Đỏ
      case 'cleaning': return 'bg-yellow-500'; // Đang dọn - Vàng
      default: return 'bg-gray-500';
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Sơ đồ phòng khách sạn</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px' }}>
        {rooms.map(room => (
          <div 
            key={room.id} 
            style={{
              border: '1px solid #ddd',
              padding: '20px',
              borderRadius: '8px',
              textAlign: 'center',
              backgroundColor: room.status === 'available' ? '#e6fffa' : '#fff5f5'
            }}
          >
            <h3>Phòng {room.id}</h3>
            <p>Loại: {room.type}</p>
            <span style={{ 
              fontWeight: 'bold', 
              color: room.status === 'available' ? 'green' : 'red' 
            }}>
              {room.status.toUpperCase()}
            </span>
            <br />
            <button style={{ marginTop: '10px' }}>
              {room.status === 'available' ? 'Check-in' : 'Chi tiết'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoomMap;