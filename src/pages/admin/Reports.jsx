import React, { useState } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Table,
  DatePicker,
  Button,
  Select,
  Space
} from 'antd';
import {
  DollarOutlined,
  HomeOutlined,
  BookOutlined,
  UserOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;
const { Option } = Select;

const Reports = () => {
  const [dateRange, setDateRange] = useState([dayjs().subtract(30, 'days'), dayjs()]);
  const [reportType, setReportType] = useState('revenue');

  // Mock data for reports
  const revenueData = [
    { month: '2024-01', revenue: 45000000, bookings: 45, occupancy: 85 },
    { month: '2024-02', revenue: 52000000, bookings: 52, occupancy: 90 },
    { month: '2024-03', revenue: 48000000, bookings: 48, occupancy: 82 },
  ];

  const roomReportData = [
    { roomNumber: '101', type: 'Phòng Đơn', bookings: 12, revenue: 6000000, occupancy: 85 },
    { roomNumber: '102', type: 'Phòng Đôi', bookings: 8, revenue: 6400000, occupancy: 75 },
    { roomNumber: '201', type: 'Phòng Gia Đình', bookings: 15, revenue: 18000000, occupancy: 95 },
  ];

  const columns = {
    revenue: [
      { title: 'Tháng', dataIndex: 'month', key: 'month' },
      { title: 'Doanh Thu', dataIndex: 'revenue', key: 'revenue', render: (value) => `${value.toLocaleString()} VNĐ` },
      { title: 'Số Đặt Phòng', dataIndex: 'bookings', key: 'bookings' },
      { title: 'Tỷ Lệ Lấp Đầy (%)', dataIndex: 'occupancy', key: 'occupancy' },
    ],
    rooms: [
      { title: 'Số Phòng', dataIndex: 'roomNumber', key: 'roomNumber' },
      { title: 'Loại Phòng', dataIndex: 'type', key: 'type' },
      { title: 'Số Lần Đặt', dataIndex: 'bookings', key: 'bookings' },
      { title: 'Doanh Thu', dataIndex: 'revenue', key: 'revenue', render: (value) => `${value.toLocaleString()} VNĐ` },
      { title: 'Tỷ Lệ Lấp Đầy (%)', dataIndex: 'occupancy', key: 'occupancy' },
    ],
  };

  const getCurrentData = () => {
    switch (reportType) {
      case 'revenue':
        return revenueData;
      case 'rooms':
        return roomReportData;
      default:
        return revenueData;
    }
  };

  const handleExport = () => {
    // Mock export functionality
    console.log('Exporting report...');
  };

  return (
    <div>
      <h1>Báo Cáo</h1>

      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} md={8}>
          <Card>
            <Statistic
              title="Tổng Doanh Thu"
              value={145000000}
              prefix={<DollarOutlined />}
              suffix="VNĐ"
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic
              title="Tổng Đặt Phòng"
              value={145}
              prefix={<BookOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} md={8}>
          <Card>
            <Statistic
              title="Tỷ Lệ Lấp Đầy Trung Bình"
              value={84}
              prefix={<HomeOutlined />}
              suffix="%"
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
      </Row>

      <Card style={{ marginBottom: '24px' }}>
        <Space style={{ marginBottom: '16px' }}>
          <Select
            value={reportType}
            onChange={setReportType}
            style={{ width: 200 }}
          >
            <Option value="revenue">Báo Cáo Doanh Thu</Option>
            <Option value="rooms">Báo Cáo Phòng</Option>
            <Option value="customers">Báo Cáo Khách Hàng</Option>
          </Select>
          <RangePicker
            value={dateRange}
            onChange={setDateRange}
            format="DD/MM/YYYY"
          />
          <Button type="primary" icon={<DownloadOutlined />} onClick={handleExport}>
            Xuất Báo Cáo
          </Button>
        </Space>

        <Table
          columns={columns[reportType] || columns.revenue}
          dataSource={getCurrentData()}
          rowKey={reportType === 'revenue' ? 'month' : 'roomNumber'}
          pagination={false}
        />
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card title="Top Phòng Được Đặt Nhiều Nhất" bordered={false}>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              <div style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                <strong>Phòng 201 (Gia Đình)</strong> - 15 lần đặt
              </div>
              <div style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                <strong>Phòng 101 (Đơn)</strong> - 12 lần đặt
              </div>
              <div style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                <strong>Phòng 102 (Đôi)</strong> - 8 lần đặt
              </div>
              <div style={{ padding: '8px 0' }}>
                <strong>Phòng 301 (Suite)</strong> - 6 lần đặt
              </div>
            </div>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="Thống Kê Theo Tháng" bordered={false}>
            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
              <div style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                <strong>Tháng 2/2024:</strong> 52.000.000 VNĐ (52 đặt phòng)
              </div>
              <div style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                <strong>Tháng 1/2024:</strong> 45.000.000 VNĐ (45 đặt phòng)
              </div>
              <div style={{ padding: '8px 0', borderBottom: '1px solid #f0f0f0' }}>
                <strong>Tháng 3/2024:</strong> 48.000.000 VNĐ (48 đặt phòng)
              </div>
              <div style={{ padding: '8px 0' }}>
                <strong>Tháng 4/2024:</strong> 38.000.000 VNĐ (38 đặt phòng)
              </div>
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default Reports;