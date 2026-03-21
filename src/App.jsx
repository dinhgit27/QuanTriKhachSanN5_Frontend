import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ConfigProvider } from 'antd';
import viVN from 'antd/locale/vi_VN';

// Components
import Login from './components/Login';
import AdminLayout from './components/AdminLayout';
import UserLayout from './components/UserLayout';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import RoomManagement from './pages/admin/RoomManagement';
import BookingManagement from './pages/admin/BookingManagement';
import CustomerManagement from './pages/admin/CustomerManagement';
import StaffManagement from './pages/admin/StaffManagement';
import Reports from './pages/admin/Reports';
import Settings from './pages/admin/Settings';

// User Pages
import UserProfile from './pages/user/UserProfile';
import UserBookings from './pages/user/UserBookings';

function App() {
  const theme = {
    token: {
      colorPrimary: '#1890ff',
      colorSuccess: '#52c41a',
      colorWarning: '#faad14',
      colorError: '#f5222d',
      colorInfo: '#1890ff',
      borderRadius: 6,
    },
    components: {
      Button: {
        borderRadius: 6,
      },
      Card: {
        borderRadius: 8,
      },
      Statistic: {
        colorText: '#1890ff',
      },
      Progress: {
        defaultColor: '#1890ff',
        remainingColor: '#f0f0f0',
      },
      Tag: {
        borderRadius: 4,
      },
    },
  };

  return (
    <ConfigProvider locale={viVN} theme={theme}>
      <Router>
        <Routes>
          {/* Default route redirects to login */}
          <Route path="/" element={<Navigate to="/login" replace />} />

          {/* Login route */}
          <Route path="/login" element={<Login />} />

          {/* Admin routes */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="rooms" element={<RoomManagement />} />
            <Route path="bookings" element={<BookingManagement />} />
            <Route path="customers" element={<CustomerManagement />} />
            <Route path="staff" element={<StaffManagement />} />
            <Route path="reports" element={<Reports />} />
            <Route path="settings" element={<Settings />} />
          </Route>

          {/* User routes */}
          <Route path="/user" element={<UserLayout />}>
            <Route index element={<Navigate to="/user/profile" replace />} />
            <Route path="profile" element={<UserProfile />} />
            <Route path="bookings" element={<UserBookings />} />
          </Route>

          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    </ConfigProvider>
  );
}

export default App;
