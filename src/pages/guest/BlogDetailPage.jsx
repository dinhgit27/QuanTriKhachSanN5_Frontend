import React, { useState, useEffect } from 'react';
import { Typography, Tag, Spin, Button, Divider } from 'antd';
import { CalendarOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { postAPI } from '../../api/postApi';

const { Title } = Typography;

const BlogDetailPage = () => {
  const { id } = useParams(); // Lấy ID bài viết từ URL
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPostDetail = async () => {
      try {
        const res = await postAPI.getPostById(id);
        setPost(res.data);
      } catch (error) {
        console.error('Lỗi tải bài viết:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPostDetail();
  }, [id]);

  if (loading) return <div style={{ textAlign: 'center', padding: '100px' }}><Spin size="large" /></div>;
  if (!post) return <div style={{ textAlign: 'center', padding: '50px' }}><Title level={3}>Không tìm thấy bài viết</Title></div>;

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '40px 20px', background: '#fff', minHeight: '100vh' }}>
      <Button type="link" icon={<ArrowLeftOutlined />} onClick={() => navigate('/blog')} style={{ marginBottom: 20, color: '#8c8c8c' }}>
        Quay lại danh sách
      </Button>

      <Tag color="gold" style={{ marginBottom: 16 }}>{post.categoryName}</Tag>
      <Title level={1} style={{ marginTop: 0 }}>{post.title}</Title>
      
      <div style={{ color: '#8c8c8c', marginBottom: 24 }}>
        <CalendarOutlined style={{ marginRight: 8 }} />
        {new Date(post.createdAt).toLocaleDateString('vi-VN')}
      </div>
      
      <Divider />

      {/* Render HTML nội dung từ React Quill */}
      <div 
        className="ql-editor" 
        style={{ fontSize: '16px', lineHeight: '1.8' }}
        dangerouslySetInnerHTML={{ __html: post.content }} 
      />
    </div>
  );
};

export default BlogDetailPage;