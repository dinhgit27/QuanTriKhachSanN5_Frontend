import React, { useState, useEffect } from "react";
import { Layout, Breadcrumb, Card, Typography, Progress, Space, Row, Col, Avatar } from "antd";
import { Link } from "react-router-dom";
import { TrophyOutlined, CrownOutlined, StarOutlined } from "@ant-design/icons";

const { Content } = Layout;
const { Title, Text } = Typography;

const ranks = [
  { name: 'Khách Mới', threshold: 0, color: '#d9d9d9' },
  { name: 'Đồng', threshold: 500, color: '#cd7f32' },
  { name: 'Bạc', threshold: 1000, color: '#c0c0c0' },
  { name: 'Vàng', threshold: 3000, color: '#ffd700' },
  { name: 'Bạch Kim', threshold: 5000, color: '#e5e4e2' },
  { name: 'Kim Cương', threshold: 20000, color: '#b9f2ff' },
  { name: 'Elite', threshold: 50000, color: '#ffb6c1' },
  { name: 'VIP', threshold: 100000, color: '#ff69b4' },
  { name: 'Signature', threshold: 200000, color: '#800080' }
];

const GuestRankPage = () => {
  const [userPoints, setUserPoints] = useState(0);
  const [currentRank, setCurrentRank] = useState(ranks[0]);
  const [nextRank, setNextRank] = useState(ranks[1]);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user')) || {};
    const userEmail = storedUser?.email || localStorage.getItem('userEmail') || 'guest@hotel.com';
    const points = Number(storedUser?.points ?? localStorage.getItem(`userPoints_${userEmail}`) ?? 0);
    setUserPoints(points);

    let current = ranks[0];
    let next = ranks[1];
    
    for (let i = 0; i < ranks.length; i++) {
      if (points >= ranks[i].threshold) {
        current = ranks[i];
        next = i + 1 < ranks.length ? ranks[i + 1] : null;
      }
    }

    setCurrentRank(current);
    setNextRank(next);
  }, []);

  const progressPercent = nextRank 
    ? ((userPoints - currentRank.threshold) / (nextRank.threshold - currentRank.threshold)) * 100
    : 100;

  return (
    <Layout style={{ minHeight: "100vh", background: "#f4f5f7" }}>
      <Content style={{ padding: "40px 50px" }}>
        <Breadcrumb separator=">" style={{ marginBottom: 24 }}>
          <Breadcrumb.Item>
            <Link to="/guest/dashboard">Dashboard</Link>
          </Breadcrumb.Item>
          <Breadcrumb.Item>Hạng thành viên</Breadcrumb.Item>
        </Breadcrumb>

        <Card style={{ borderRadius: 18, boxShadow: "0 8px 24px rgba(0,0,0,0.08)", marginBottom: 24 }}>
          <Row gutter={[24, 24]} align="middle">
            <Col xs={24} md={8} style={{ textAlign: 'center' }}>
              <Avatar 
                size={120} 
                icon={<CrownOutlined />} 
                style={{ 
                  background: currentRank.color, 
                  color: '#fff',
                  border: '4px solid #fff',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                }} 
              />
              <Title level={3} style={{ marginTop: 16 }}>{currentRank.name}</Title>
              <Text type="secondary">Hạng hiện tại</Text>
            </Col>
            
            <Col xs={24} md={16}>
              <Card type="inner" style={{ borderRadius: 12, background: '#fafafa' }}>
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Space>
                      <StarOutlined style={{ fontSize: 24, color: '#fadb14' }} />
                      <Title level={4} style={{ margin: 0 }}>Điểm tích lũy: {userPoints.toLocaleString()} điểm</Title>
                    </Space>
                  </div>
                  
                  {nextRank ? (
                    <>
                      <Text>
                        Bạn cần thêm <strong>{(nextRank.threshold - userPoints).toLocaleString()} điểm</strong> nữa để thăng hạng lên <strong>{nextRank.name}</strong>.
                      </Text>
                      <Progress 
                        percent={Math.floor(progressPercent)} 
                        status="active"
                        strokeColor={{
                          '0%': currentRank.color,
                          '100%': nextRank.color,
                        }}
                        size={["100%", 20]}
                      />
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Text type="secondary">{currentRank.threshold.toLocaleString()} điểm</Text>
                        <Text type="secondary">{nextRank.threshold.toLocaleString()} điểm</Text>
                      </div>
                    </>
                  ) : (
                    <>
                      <Text type="success">Chúc mừng! Bạn đã đạt hạng cao nhất của hệ thống.</Text>
                      <Progress percent={100} strokeColor="#800080" size={["100%", 20]} />
                    </>
                  )}
                </Space>
              </Card>
            </Col>
          </Row>
        </Card>

        <Card title={<><TrophyOutlined /> Hệ thống Hạng thành viên</>} style={{ borderRadius: 18, boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}>
          <Row gutter={[16, 16]}>
            {ranks.map((rank, index) => (
              <Col xs={24} sm={12} md={8} lg={6} key={index}>
                <Card 
                  size="small" 
                  style={{ 
                    borderRadius: 12, 
                    borderLeft: `6px solid ${rank.color}`,
                    background: currentRank.name === rank.name ? '#f0f5ff' : '#fff'
                  }}
                >
                  <Title level={5} style={{ margin: 0, color: currentRank.name === rank.name ? '#1890ff' : '#333' }}>
                    {rank.name}
                  </Title>
                  <Text type="secondary">
                    Yêu cầu: {rank.threshold.toLocaleString()} điểm
                  </Text>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      </Content>
    </Layout>
  );
};

export default GuestRankPage;
