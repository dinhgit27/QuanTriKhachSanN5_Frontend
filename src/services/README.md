# API Service Documentation

## Tổng quan
File `api.js` cung cấp một cách tập trung để quản lý tất cả các API calls với backend. Nó sử dụng Axios và bao gồm các tính năng như authentication, error handling, và interceptors.

## Cấu trúc

### 1. Cấu hình cơ bản
```javascript
import { roomAPI, bookingAPI, authAPI } from '../services/api';
```

### 2. Sử dụng trong Component
```javascript
import React, { useState, useEffect } from 'react';
import { roomAPI } from '../services/api';

const MyComponent = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await roomAPI.getAll();
        setData(response.data);
      } catch (error) {
        console.error('Error:', error);
      }
    };
    fetchData();
  }, []);

  return <div>{/* JSX code */}</div>;
};
```

## API Modules

### Authentication (`authAPI`)
- `login(credentials)` - Đăng nhập
- `register(userData)` - Đăng ký
- `logout()` - Đăng xuất
- `getProfile()` - Lấy thông tin profile

### Rooms (`roomAPI`)
- `getAll(params)` - Lấy tất cả phòng
- `getById(id)` - Lấy phòng theo ID
- `create(roomData)` - Tạo phòng mới
- `update(id, roomData)` - Cập nhật phòng
- `delete(id)` - Xóa phòng
- `updateStatus(id, status)` - Cập nhật trạng thái phòng

### Bookings (`bookingAPI`)
- `getAll(params)` - Lấy tất cả đặt phòng
- `getById(id)` - Lấy đặt phòng theo ID
- `create(bookingData)` - Tạo đặt phòng mới
- `update(id, bookingData)` - Cập nhật đặt phòng
- `delete(id)` - Xóa đặt phòng
- `confirm(id)` - Xác nhận đặt phòng
- `cancel(id)` - Hủy đặt phòng
- `getUserBookings()` - Lấy đặt phòng của user hiện tại

### Customers (`customerAPI`)
- `getAll(params)` - Lấy tất cả khách hàng
- `getById(id)` - Lấy khách hàng theo ID
- `create(customerData)` - Tạo khách hàng mới
- `update(id, customerData)` - Cập nhật khách hàng
- `delete(id)` - Xóa khách hàng
- `updateStatus(id, status)` - Cập nhật trạng thái khách hàng

### Staff (`staffAPI`)
- `getAll(params)` - Lấy tất cả nhân viên
- `getById(id)` - Lấy nhân viên theo ID
- `create(staffData)` - Tạo nhân viên mới
- `update(id, staffData)` - Cập nhật nhân viên
- `delete(id)` - Xóa nhân viên
- `updateStatus(id, status)` - Cập nhật trạng thái nhân viên

### Reports (`reportAPI`)
- `getRevenue(params)` - Lấy báo cáo doanh thu
- `getRoomStats(params)` - Lấy thống kê phòng
- `getCustomerStats(params)` - Lấy thống kê khách hàng
- `exportReport(type, params)` - Xuất báo cáo

### Settings (`settingsAPI`)
- `getAll()` - Lấy tất cả cài đặt
- `update(settingsData)` - Cập nhật cài đặt
- `getSystemInfo()` - Lấy thông tin hệ thống

## Error Handling

Service tự động xử lý một số lỗi phổ biến:
- **401 Unauthorized**: Tự động redirect về trang login
- **Network errors**: Hiển thị thông báo lỗi
- **Timeout**: Tự động retry hoặc hiển thị thông báo

## Authentication

Service tự động thêm JWT token vào header của mỗi request nếu có token trong localStorage.

## Cấu hình

### Thay đổi Base URL
```javascript
// Trong api.js
const API_BASE_URL = 'http://your-backend-url:port/api';
```

### Thay đổi Timeout
```javascript
// Trong api.js
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // 15 seconds
  // ...
});
```

## Best Practices

1. **Luôn sử dụng try-catch** khi gọi API
2. **Hiển thị loading state** cho UX tốt hơn
3. **Refresh data** sau khi thực hiện mutations (create, update, delete)
4. **Sử dụng message từ antd** để hiển thị thông báo
5. **Validate data** trước khi gửi lên server

## Ví dụ hoàn chỉnh

```javascript
import React, { useState, useEffect } from 'react';
import { Table, Button, message, Space } from 'antd';
import { roomAPI } from '../services/api';

const RoomList = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await roomAPI.getAll();
      setRooms(response.data);
    } catch (error) {
      message.error('Không thể tải danh sách phòng');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleDelete = async (id) => {
    try {
      await roomAPI.delete(id);
      message.success('Xóa phòng thành công');
      fetchRooms(); // Refresh data
    } catch (error) {
      message.error('Không thể xóa phòng');
    }
  };

  return (
    <Table
      dataSource={rooms}
      loading={loading}
      columns={[
        { title: 'Số Phòng', dataIndex: 'roomNumber' },
        { title: 'Loại Phòng', dataIndex: 'type' },
        {
          title: 'Hành Động',
          render: (_, record) => (
            <Button danger onClick={() => handleDelete(record.id)}>
              Xóa
            </Button>
          )
        }
      ]}
    />
  );
};
```