import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Typography, Tag, Spin, Button } from 'antd';
import { CalendarOutlined, ArrowRightOutlined, HomeOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { postAPI } from '../../api/postApi'; // Đường dẫn có thể thay đổi tùy thư mục của bạn

const { Title, Paragraph } = Typography;

const BlogPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await postAPI.getPosts();
        setPosts(res.data);
      } catch (error) {
        console.error('Lỗi tải bài viết:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchPosts();
  }, []);

  if (loading) return <div style={{ textAlign: 'center', padding: '100px' }}><Spin size="large" /></div>;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 40 }}>
        <Title level={2} style={{ margin: 0 }}>📰 Grand Hotel Blog</Title>
        <Button icon={<HomeOutlined />} onClick={() => navigate('/login')}>Quay về đăng nhập</Button>
      </div>

      <Row gutter={[24, 24]}>
        {posts.map(post => (
          <Col xs={24} sm={12} md={8} key={post.id}>
            <Card 
              hoverable 
              style={{ borderRadius: 12, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}
              bodyStyle={{ flex: 1, display: 'flex', flexDirection: 'column' }}
            >
              <Tag color="gold" style={{ alignSelf: 'flex-start', marginBottom: 10 }}>{post.categoryName}</Tag>
              <Title level={4} style={{ marginTop: 0, minHeight: 56 }}>{post.title}</Title>
              <div style={{ color: '#8c8c8c', marginBottom: 16 }}>
                <CalendarOutlined style={{ marginRight: 8 }} />
                {new Date(post.createdAt).toLocaleDateString('vi-VN')}
              </div>
              
              {/* Nút Đọc tiếp đẩy xuống dưới cùng */}
              <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid #f0f0f0' }}>
                <Button type="link" style={{ padding: 0, color: '#c19b4a' }} onClick={() => navigate(`/blog/${post.id}`)}>
                  Đọc tiếp <ArrowRightOutlined />
                </Button>
              </div>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
};

export default BlogPage;