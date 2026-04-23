import React, { useState, useEffect } from 'react';
import { Table, Modal, Form, Input, Select, Button, Row, Col, Space, Typography, Tag, message, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { postAPI } from '../../api/postApi';
import { useLoadingStore } from '../../store/loadingStore';

const { Title } = Typography;
const { Option } = Select;

const PostListPage = () => {
  const setLoading = useLoadingStore((state) => state.setLoading);
  const [posts, setPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form] = Form.useForm();

  // Load dữ liệu khi vào trang
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Gọi song song 2 API lấy Bài viết và Danh mục
      const [postRes, categoryRes] = await Promise.all([
        postAPI.getPosts(),
        postAPI.getCategories()
      ]);
      setPosts(postRes.data);
      setCategories(categoryRes.data);
    } catch (error) {
      message.error('Lỗi khi tải dữ liệu bài viết!');
    } finally {
      setLoading(false);
    }
  };

  // Mở modal Thêm mới
  const handleAddNew = () => {
    setEditingId(null);
    form.resetFields();
    setModalVisible(true);
  };

  // Nút Lưu (Thêm mới)
  const handleSubmitForm = async (values) => {
    setLoading(true);
    try {
      if (editingId) {
        message.warning('Chức năng sửa đang được cập nhật!');
      } else {
        await postAPI.createPost(values);
        message.success('Đăng bài viết thành công!');
      }
      setModalVisible(false);
      fetchData(); // Tải lại bảng
    } catch (error) {
      console.error("CHI TIẾT LỖI TỪ BACKEND:", error.response);

      // --- ĐOẠN CODE BẮT BỆNH MỚI ---
      if (error.response?.status === 403) {
        message.error('🚫 Lỗi 403: Tài khoản của bạn không có quyền Đăng bài!');
      } 
      else if (error.response?.status === 401) {
        message.error('🔒 Lỗi 401: Phiên đăng nhập hết hạn, vui lòng đăng nhập lại!');
      }
      else if (error.response?.data?.errors) {
        // Bắt lỗi Model Validation của C# (Ví dụ: thiếu field Image, Description...)
        const errorMessages = Object.values(error.response.data.errors).flat().join(', ');
        message.error('⚠️ Báo lỗi từ C#: ' + errorMessages, 5); // Hiển thị 5 giây cho dễ đọc
      } 
      else {
        message.error(error.response?.data?.message || '❌ Có lỗi xảy ra, không thể kết nối!');
      }
    } finally {
      setLoading(false);
    }
  };
  // Xóa bài viết
  const handleDelete = async (id) => {
    setLoading(true);
    try {
      await postAPI.deletePost(id);
      message.success('Đã xóa bài viết!');
      fetchData();
    } catch (error) {
      message.error('Lỗi khi xóa bài viết!');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id', width: 60 },
    { title: 'Tiêu đề', dataIndex: 'title', key: 'title', ellipsis: true },
    { 
      title: 'Danh mục', 
      dataIndex: 'categoryName', 
      key: 'categoryName',
      render: (text) => <Tag color="blue">{text}</Tag>
    },
    { 
      title: 'Ngày đăng', 
      dataIndex: 'createdAt', 
      key: 'createdAt',
      render: (date) => new Date(date).toLocaleDateString('vi-VN')
    },
    {
      title: 'Thao tác',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          <Popconfirm
            title="Bạn có chắc chắn muốn xóa bài này?"
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
          >
            <Button danger icon={<DeleteOutlined />} size="small">Xóa</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, background: '#fff', borderRadius: 8 }}>
      <Row justify="space-between" align="middle" style={{ marginBottom: 16 }}>
        <Col>
          <Title level={3}>📝 Quản lý Bài viết & Tin tức</Title>
        </Col>
        <Col>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddNew}>
            Viết bài mới
          </Button>
        </Col>
      </Row>

      <Table 
        columns={columns} 
        dataSource={posts} 
        rowKey="id" 
        pagination={{ pageSize: 8 }} 
      />

      <Modal 
        title="Viết bài mới" 
        open={modalVisible} 
        onCancel={() => setModalVisible(false)} 
        footer={null} 
        width={800} // Form viết bài cần rộng rãi
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSubmitForm}>
          <Form.Item 
            name="title" 
            label="Tiêu đề bài viết" 
            rules={[{ required: true, message: 'Vui lòng nhập tiêu đề!' }]}
          >
            <Input placeholder="Ví dụ: 5 điểm đến không thể bỏ lỡ tại Đà Nẵng..." size="large" />
          </Form.Item>

          <Form.Item 
            name="categoryId" 
            label="Chuyên mục" 
            rules={[{ required: true, message: 'Vui lòng chọn chuyên mục!' }]}
          >
            <Select placeholder="Chọn chuyên mục">
              {categories.map(cat => (
                <Option key={cat.id} value={cat.id}>{cat.name}</Option>
              ))}
            </Select>
          </Form.Item>

          {/* TÍCH HỢP TRÌNH SOẠN THẢO REACT-QUILL TẠI ĐÂY */}
          <Form.Item 
            name="content" 
            label="Nội dung bài viết" 
            rules={[{ required: true, message: 'Nội dung không được để trống!' }]}
          >
            <ReactQuill 
              theme="snow" 
              style={{ height: '300px', marginBottom: '40px' }} 
              placeholder="Bắt đầu viết nội dung tại đây..."
            />
          </Form.Item>
          
          <Form.Item style={{ textAlign: 'right', marginTop: 20 }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">Đăng bài</Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default PostListPage;