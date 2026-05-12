import React, { useState, useEffect } from 'react';
import {
  Table,
  Modal,
  Form,
  Input,
  Select,
  Button,
  Tag,
  Space,
  Typography,
  message,
  Card,
  DatePicker,
  Row,
  Col,
  Tooltip,
  Badge,
  Drawer,
  Divider,
  Descriptions,
} from 'antd';
import { minifyJson, prettyJson } from '../../utils/jsonHelpers';
import {
  SearchOutlined,
  EyeOutlined,
  ReloadOutlined,
  FileExcelOutlined,
  CalendarOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/vi';
import { auditLogApi } from '../../api/auditLogApi';
import { useLoadingStore } from '../../store/loadingStore';
import { useAuditLogStore } from '../../store/auditLogStore';

dayjs.extend(relativeTime);
dayjs.locale('vi');

const { Title, Text } = Typography;
const { RangePicker } = DatePicker;
const { Option } = Select;

// Màu sắc cho các hành động
const ACTION_COLORS = {
  CREATE: { color: '#52c41a', label: 'Thêm' },
  UPDATE: { color: '#faad14', label: 'Sửa' },
  DELETE: { color: '#ff4d4f', label: 'Xóa' },
  CHECKIN: { color: '#1890ff', label: 'Check-in' },
  CHECKOUT: { color: '#13c2c2', label: 'Check-out' },
  PAYMENT: { color: '#722ed1', label: 'Thanh toán' },
  LOGIN: { color: '#eb2f96', label: 'Đăng nhập' },
  OTHER: { color: '#666', label: 'Khác' },
};

// Dropdown loại hành động
const ACTION_TYPES = [
  { label: 'Tất cả', value: '' },
  { label: 'Thêm', value: 'CREATE' },
  { label: 'Sửa', value: 'UPDATE' },
  { label: 'Xóa', value: 'DELETE' },
  { label: 'Đăng nhập', value: 'LOGIN' },
  { label: 'Check-in', value: 'CHECKIN' },
  { label: 'Check-out', value: 'CHECKOUT' },
  { label: 'Thanh toán', value: 'PAYMENT' },
  { label: 'Khác', value: 'OTHER' },
];

// Dropdown module
const MODULES = [
  { label: 'Tất cả', value: '' },
  { label: 'Nhân viên & Quyền', value: 'Nhân viên & Quyền' },
  { label: 'Quản lý Phòng', value: 'Quản lý Phòng' },
  { label: 'Kho Vật Tư', value: 'Kho Vật Tư' },
  { label: 'Vật Tư Theo Phòng', value: 'Vật Tư Theo Phòng' },
  { label: 'Biên Bản Đền Bù', value: 'Biên Bản Đền Bù' },
  { label: 'Đặt Phòng', value: 'Đặt Phòng' },
  { label: 'Khách Hàng', value: 'Khách Hàng' },
  { label: 'Thanh Toán', value: 'Thanh Toán' },
  { label: 'Hệ thống', value: 'Hệ thống' },
];

const AuditLogsPage = () => {
  const setLoading = useLoadingStore((state) => state.setLoading);
  const storeAuditLogs = useAuditLogStore((state) => state.auditLogs);

  // --- STATE ---
  const [auditLogs, setAuditLogs] = useState([]);
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [localLoading, setLocalLoading] = useState(false);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10 });
  const [detailDrawerVisible, setDetailDrawerVisible] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [selectedRows, setSelectedRows] = useState([]); // Xóa hàng loạt
  const [bulkDeleteConfirm, setBulkDeleteConfirm] = useState(false);
  const deleteMultipleAuditLogs = useAuditLogStore((state) => state.deleteMultipleAuditLogs);

  // --- FILTERS ---
  const [searchText, setSearchText] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [filterModule, setFilterModule] = useState('');
  const [dateRange, setDateRange] = useState([null, null]);

  // --- FETCH DỮ LIỆU ---
  const fetchAuditLogs = async () => {
    setLocalLoading(true);
    setLoading(true);
    try {
      // Lấy từ API (mock or backend)
      const response = await auditLogApi.getAuditLogs();
      const mockData = response.data || [];

      // Combine and remove duplicates by ID or composite key
      const allLogs = [...storeAuditLogs, ...mockData];
      const seen = new Set();
      const combinedLogs = allLogs.filter(log => {
        const key = log.eventId || `${log.timestamp}-${log.description}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      
      setAuditLogs(combinedLogs);
      setFilteredLogs(combinedLogs);
    } catch (error) {
      message.error('Lỗi khi tải Audit Logs!');
      console.error('Error fetching audit logs:', error);
      // Fallback: chỉ dùng store logs
      setAuditLogs(storeAuditLogs);
      setFilteredLogs(storeAuditLogs);
    } finally {
      setLocalLoading(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, [storeAuditLogs]); // Re-fetch mỗi khi store thay đổi

  // --- BỘ LỌC TỔNG HỢP ---
  useEffect(() => {
    let result = auditLogs;

    // Filter by search text (tìm kiếm theo tên người dùng, hành động, bảng)
    if (searchText) {
      const text = searchText.toLowerCase();
      result = result.filter((log) => {
        const matchUserName = log.userName?.toLowerCase().includes(text);
        const matchAction = log.action?.toLowerCase().includes(text);
        const matchTable = log.tableName?.toLowerCase().includes(text);
        return matchUserName || matchAction || matchTable;
      });
    }

    // Filter by action type
    if (filterAction) {
      result = result.filter((log) => log.action === filterAction);
    }

    // Filter by date range
    if (dateRange[0] && dateRange[1]) {
      const startDate = dayjs(dateRange[0]).startOf('day');
      const endDate = dayjs(dateRange[1]).endOf('day');
      result = result.filter((log) => {
        const logDate = dayjs(log.createdAt);
        return logDate.isAfter(startDate) && logDate.isBefore(endDate);
      });
    }

    // Sắp xếp theo thời gian giảm dần (mới nhất trước)
    result.sort((a, b) => dayjs(b.createdAt).diff(dayjs(a.createdAt)));

    setFilteredLogs(result);
    setPagination((prev) => ({ ...prev, current: 1 }));
  }, [searchText, filterAction, dateRange, auditLogs]);

  // --- HANDLERS ---
  const handleTableChange = (pag) => {
    setPagination({ current: pag.current, pageSize: pag.pageSize });
  };

  const handleRefresh = () => {
    setSearchText('');
    setFilterAction('');
    setFilterModule('');
    setDateRange([null, null]);
    fetchAuditLogs();
    message.success('Đã làm mới dữ liệu!');
  };

  const handleExportExcel = () => {
    message.info('Tính năng xuất Excel đang được phát triển!');
    // TODO: Implement export Excel functionality
  };

  const handleViewDetail = (record) => {
    setSelectedLog(record);
    setDetailDrawerVisible(true);
  };

  const handleBulkDelete = () => {
    if (selectedRows.length === 0) {
      message.warning('Vui lòng chọn ít nhất 1 bản ghi!');
      return;
    }
    setBulkDeleteConfirm(true);
  };

  const handleConfirmBulkDelete = () => {
    deleteMultipleAuditLogs(selectedRows);
    setSelectedRows([]);
    setBulkDeleteConfirm(false);
    message.success(`Đã xóa ${selectedRows.length} bản ghi!`);
  };

  // --- COLUMNS TABLE ---
  const columns = [
    {
      title: 'STT',
      key: 'stt',
      width: 50,
      render: (_, __, index) => {
        return (
          (pagination.current - 1) * pagination.pageSize + index + 1
        );
      },
    },
    {
      title: 'Thời gian',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 180,
      sorter: (a, b) => dayjs(b.createdAt).diff(dayjs(a.createdAt)),
      render: (createdAt) => (
        <Tooltip title={dayjs(createdAt).format('DD/MM/YYYY HH:mm:ss')}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 500 }}>
              {dayjs(createdAt).format('DD/MM/YYYY HH:mm:ss')}
            </div>
            <div style={{ fontSize: 12, color: '#999' }}>
              ({dayjs(createdAt).fromNow()})
            </div>
          </div>
        </Tooltip>
      ),
    },
    {
      title: 'Người thực hiện',
      key: 'user',
      width: 200,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.userName || 'Hệ thống'}</div>
        </div>
      ),
    },
    {
      title: 'Hành động',
      dataIndex: 'action',
      key: 'action',
      width: 100,
      render: (action) => {
        const colorObj = ACTION_COLORS[action] || ACTION_COLORS.OTHER;
        return (
          <Tag color={colorObj.color} style={{ borderRadius: 4 }}>
            {colorObj.label || action}
          </Tag>
        );
      },
    },
    {
      title: 'Bảng / ID Bản ghi',
      key: 'table',
      width: 180,
      render: (_, record) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.tableName}</div>
          <div style={{ fontSize: 12, color: '#999' }}>ID: {record.recordId}</div>
        </div>
      ),
    },
    {
      title: 'Chi tiết thay đổi',
      key: 'changeDetails',
      width: 250,
      render: (_, record) => (
        <Tooltip title={record.newValue}>
          <div
            style={{
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              fontSize: 13,
            }}
          >
            {record.newValue || 'Không có chi tiết'}
          </div>
        </Tooltip>
      ),
    },
    {
      title: 'Thao tác',
      key: 'actionButton',
      width: 100,
      fixed: 'right',
      render: (_, record) => (
        <Space size="small">
          <Button
            type="primary"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            Xem
          </Button>
        </Space>
      ),
    },
  ];

  // --- BỘ DỮ LIỆU DỊCH FIELD NAMES SANG TIẾNG VIỆT ---
  const FIELD_NAME_VI = {
    // Chung
    id: 'ID',
    name: 'Tên',
    description: 'Mô tả',
    status: 'Trạng thái',
    createdAt: 'Ngày tạo',
    updatedAt: 'Ngày cập nhật',

    // Phòng
    roomNumber: 'Số phòng',
    roomTypeId: 'Loại phòng',
    floor: 'Tầng',
    capacity: 'Sức chứa',
    pricePerNight: 'Giá/đêm',
    cleaningStatus: 'Trạng thái dọn dẹp',

    // Vật tư
    amenityName: 'Tên vật tư',
    quantity: 'Số lượng',
    quantityInRoom: 'Số lượng trong phòng',
    quantityInWarehouse: 'Số lượng trong kho',
    price: 'Giá',
    importPrice: 'Giá nhập',
    compensationPrice: 'Giá bù trừ',
    supplier: 'Nhà cung cấp',
    isActive: 'Trạng thái',

    // Người dùng
    email: 'Email',
    userName: 'Tên người dùng',
    fullName: 'Họ và tên',
    phone: 'Điện thoại',
    role: 'Vai trò',
    isLocked: 'Bị khóa',

    // Biên bản đền bù
    penaltyAmount: 'Số tiền phạt',
    roomInventoryId: 'ID vật tư phòng',
    lossAndDamageId: 'ID biên bản',

    // Booking
    guestName: 'Tên khách',
    checkInDate: 'Ngày nhận phòng',
    checkOutDate: 'Ngày trả phòng',
    numberOfGuests: 'Số khách',
    totalPrice: 'Tổng giá',
    bookingStatus: 'Trạng thái đặt',
  };

  // Dịch các giá trị tiếng Anh sang tiếng Việt
  const ENGLISH_TO_VI = {
    // Status
    'Active': 'Hoạt động',
    'Inactive': 'Không hoạt động',
    'Pending': 'Chờ xử lý',
    'Paid': 'Đã thanh toán',
    'Unpaid': 'Chưa thanh toán',
    'Confirmed': 'Đã xác nhận',
    'Cancelled': 'Đã hủy',
    'Completed': 'Hoàn thành',
    
    // Room status
    'Available': 'Có sẵn',
    'Occupied': 'Đã cho thuê',
    'Dirty': 'Bẩn',
    'Clean': 'Sạch',
    'Maintenance': 'Bảo trì',
    
    // Check-in/out
    'Checked-in': 'Đã nhận phòng',
    'Checked-out': 'Đã trả phòng',
    'Full': 'Đầy',
    'Partial': 'Thiếu',
    
    // Payment
    'Cash': 'Tiền mặt',
    'Card': 'Thẻ',
    'Bank Transfer': 'Chuyển khoản',
    'Router': 'Bộ phát WiFi',
    
    // Role
    'Admin': 'Quản trị viên',
    'Manager': 'Quản lý',
    'Receptionist': 'Lễ tân',
    'Housekeeper': 'Nhân viên vệ sinh',
  };

  const translateValue = (value) => {
    if (typeof value === 'string' && ENGLISH_TO_VI[value]) {
      return ENGLISH_TO_VI[value];
    }
    return value;
  };

  const translateFieldName = (fieldName) => {
    return FIELD_NAME_VI[fieldName] || fieldName;
  };

  // --- HÀM FORMAT CHI TIẾT THAY ĐỔI ---
  const formatChangeDetails = (log) => {
    const { actionType, oldValue, newValue, description } = log;

    // Nếu không có oldValue/newValue, dùng description
    if (!oldValue && !newValue) {
      return translateValue(description);
    }

    let changeText = '';

    if (actionType === 'CREATE') {
      changeText += `✨ Tạo mới ${log.objectName}`;
      if (newValue) {
        const changes = Object.entries(newValue)
          .filter(([key, value]) => value !== null && value !== undefined && value !== '')
          .slice(0, 3)
          .map(([key, value]) => {
            const translatedVal = translateValue(String(value).slice(0, 30));
            return `${translateFieldName(key)}: ${translatedVal}`;
          })
          .join(', ');
        if (changes) changeText += ` (${changes})`;
      }
    } else if (actionType === 'DELETE') {
      changeText += `🗑️ Xóa ${log.objectName}`;
      if (oldValue) {
        const info = Object.entries(oldValue)
          .filter(([key, value]) => value !== null && value !== undefined)
          .slice(0, 2)
          .map(([key, value]) => {
            const translatedVal = translateValue(String(value).slice(0, 20));
            return `${translateFieldName(key)}: ${translatedVal}`;
          })
          .join(', ');
        if (info) changeText += ` (${info})`;
      }
    } else if (actionType === 'UPDATE') {
      changeText += `✏️ Cập nhật ${log.objectName}`;
      
      if (oldValue && newValue && typeof oldValue === 'object' && typeof newValue === 'object') {
        const changes = [];
        Object.keys(newValue).forEach((key) => {
          if (oldValue[key] !== newValue[key]) {
            const oldVal = oldValue[key] === true || oldValue[key] === false ? '-' : translateValue(String(oldValue[key] || '-').slice(0, 20));
            const newVal = newValue[key] === true || newValue[key] === false ? '-' : translateValue(String(newValue[key] || '-').slice(0, 20));
            changes.push(`${translateFieldName(key)}: "${oldVal}" → "${newVal}"`);
          }
        });
        if (changes.length > 0) {
          changeText += `\n${changes.slice(0, 3).join('\n')}`;
          if (changes.length > 3) changeText += `\n... và ${changes.length - 3} thay đổi khác`;
        }
      }
    } else {
      changeText = description;
    }

    return changeText;
  };

  // --- RENDER DETAIL DRAWER ---
  const renderDetailDrawer = () => {
    if (!selectedLog) return null;

    const formatValue = (value) => {
      if (value === null || value === undefined) return '-';
      if (value === true) return 'true';
      if (value === false) return 'false';
      if (typeof value === 'object') {
        return prettyJson(value);
      }
      return String(value);
    };

    return (
      <Drawer
        title={`Chi tiết Audit Log #${selectedLog.id}`}
        onClose={() => setDetailDrawerVisible(false)}
        open={detailDrawerVisible}
        width={700}
        bodyStyle={{ paddingBottom: 80 }}
      >
        <Descriptions bordered column={1} size="small" style={{ marginBottom: 24 }}>
          <Descriptions.Item label="Thời gian">
            {dayjs(selectedLog.createdAt).format('DD/MM/YYYY HH:mm:ss')}
          </Descriptions.Item>
          <Descriptions.Item label="Người thực hiện">
            <div>
              <div style={{ fontWeight: 500 }}>{selectedLog.userName || 'Hệ thống'}</div>
            </div>
          </Descriptions.Item>
          <Descriptions.Item label="Hành động">
            <Tag
              color={
                ACTION_COLORS[selectedLog.action]?.color ||
                ACTION_COLORS.OTHER.color
              }
              style={{ borderRadius: 4 }}
            >
              {ACTION_COLORS[selectedLog.action]?.label || selectedLog.action}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Bảng tác động">
            {selectedLog.tableName}
          </Descriptions.Item>
          <Descriptions.Item label="ID Bản ghi">
            {selectedLog.recordId}
          </Descriptions.Item>
          <Descriptions.Item label="Giá trị cũ (Old Value)">
            <div style={{ fontFamily: 'monospace', fontSize: 12, whiteSpace: 'pre-wrap', backgroundColor: '#fff2f0', padding: 8, borderRadius: 4 }}>
              {formatValue(selectedLog.oldValue)}
            </div>
          </Descriptions.Item>
          <Descriptions.Item label="Giá trị mới (New Value)">
            <div style={{ fontFamily: 'monospace', fontSize: 12, whiteSpace: 'pre-wrap', backgroundColor: '#f6ffed', padding: 8, borderRadius: 4 }}>
              {formatValue(selectedLog.newValue)}
            </div>
          </Descriptions.Item>
        </Descriptions>
      </Drawer>
    );
  };

  return (
    <div style={{ padding: '20px' }}>
      {/* --- HEADER --- */}
      <div style={{ marginBottom: 24 }}>
        <Title level={2} style={{ marginBottom: 0 }}>
          Nhật ký Hoạt động
        </Title>
        <Text type="secondary">
          Theo dõi toàn bộ lịch sử thay đổi và hoạt động của hệ thống quản lý khách sạn
        </Text>
      </div>

      {/* --- FILTER SECTION --- */}
      <Card style={{ marginBottom: 24, borderRadius: 8 }}>
        <Form layout="vertical">
          <Row gutter={[16, 16]}>
            {/* Tìm kiếm */}
            <Col xs={24} sm={24} md={6}>
              <Form.Item label="Tìm kiếm">
                <Input
                  placeholder="Tìm theo tên, email, hành động..."
                  prefix={<SearchOutlined />}
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  allowClear
                />
              </Form.Item>
            </Col>

            {/* Loại hành động */}
            <Col xs={24} sm={24} md={6}>
              <Form.Item label="Loại hành động">
                <Select
                  placeholder="Chọn loại hành động"
                  value={filterAction}
                  onChange={(value) => setFilterAction(value)}
                  allowClear
                >
                  {ACTION_TYPES.map((item) => (
                    <Option key={item.value} value={item.value}>
                      {item.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            {/* Module */}
            <Col xs={24} sm={24} md={6}>
              <Form.Item label="Module">
                <Select
                  placeholder="Chọn module"
                  value={filterModule}
                  onChange={(value) => setFilterModule(value)}
                  allowClear
                >
                  {MODULES.map((item) => (
                    <Option key={item.value} value={item.value}>
                      {item.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            {/* Date Range */}
            <Col xs={24} sm={24} md={6}>
              <Form.Item label="Thời gian">
                <RangePicker
                  style={{ width: '100%' }}
                  placeholder={['Từ ngày', 'Đến ngày']}
                  value={dateRange[0] && dateRange[1] ? [dayjs(dateRange[0]), dayjs(dateRange[1])] : []}
                  onChange={(dates) => {
                    if (dates && dates[0] && dates[1]) {
                      setDateRange([dates[0], dates[1]]);
                    } else {
                      setDateRange([null, null]);
                    }
                  }}
                  format="DD/MM/YYYY"
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Buttons */}
          <Row gutter={[16, 16]}>
            <Col>
              <Button
                type="primary"
                icon={<ReloadOutlined />}
                onClick={handleRefresh}
              >
                Làm mới
              </Button>
            </Col>
            <Col>
              <Button
                icon={<FileExcelOutlined />}
                onClick={handleExportExcel}
              >
                Xuất Excel
              </Button>
            </Col>
            {selectedRows.length > 0 && (
              <Col>
                <Button
                  type="primary"
                  danger
                  icon={<DeleteOutlined />}
                  onClick={handleBulkDelete}
                >
                  Xóa ({selectedRows.length})
                </Button>
              </Col>
            )}
          </Row>
        </Form>
      </Card>

      {/* --- TABLE --- */}
      <Card style={{ borderRadius: 8 }}>
        <Table
          columns={columns}
          dataSource={filteredLogs}
          rowKey="id"
          loading={localLoading}
          rowSelection={{
            selectedRowKeys: selectedRows,
            onChange: (selectedRowKeys) => {
              setSelectedRows(selectedRowKeys);
            },
          }}
          pagination={{
            current: pagination.current,
            pageSize: pagination.pageSize,
            total: filteredLogs.length,
            showSizeChanger: true,
            showTotal: (total) => `Tổng cộng ${total} bản ghi`,
            pageSizeOptions: ['10', '20', '50', '100'],
            locale: {
              items_per_page: ' / trang',
              jump_to: 'Đi đến',
              jump_to_confirm: 'Xác nhận',
              page: ' ',
            },
          }}
          onChange={handleTableChange}
          scroll={{ x: 1200 }}
          size="middle"
        />
      </Card>

      {/* --- DETAIL DRAWER --- */}
      {renderDetailDrawer()}

      {/* --- BULK DELETE MODAL --- */}
      <Modal
        title="Xác nhận xóa hàng loạt"
        open={bulkDeleteConfirm}
        onCancel={() => setBulkDeleteConfirm(false)}
        footer={[
          <Button key="cancel" onClick={() => setBulkDeleteConfirm(false)}>
            Hủy
          </Button>,
          <Button
            key="delete"
            type="primary"
            danger
            onClick={handleConfirmBulkDelete}
          >
            Xóa ({selectedRows.length} bản ghi)
          </Button>,
        ]}
      >
        <p>
          Bạn chắc chắn muốn xóa <strong>{selectedRows.length} bản ghi</strong> này không?
        </p>
        <p style={{ color: '#ff4d4f' }}>
          ⚠️ Hành động này không thể hoàn tác!
        </p>
      </Modal>
    </div>
  );
};

export default AuditLogsPage;