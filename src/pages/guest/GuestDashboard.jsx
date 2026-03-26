import React from 'react';
import { Card, Row, Col, Avatar, Descriptions, Tag, Statistic, Table, Tabs } from 'antd';
import { UserOutlined, WalletOutlined, CheckCircleOutlined, CrownOutlined, HistoryOutlined } from '@ant-design/icons';

const GuestDashboard = () => {
    // Dữ liệu hiển thị mẫu
    const user = {
        fullName: "Ngô Xuân Kiều", //
        email: "xuankieu@lhu.edu.vn", //
        points: 1250,
        rank: "Thành viên Vàng"
    };

    return (
        <div style={{ padding: '24px' }}>
            <h2 style={{ marginBottom: 20 }}>Bảng điều khiển khách hàng</h2>

            {/* --- 3 CARD THỐNG KÊ --- */}
            <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
                <Col span={8}>
                    <Card hoverable style={{ borderRadius: '12px', borderBottom: '4px solid #1890ff' }}>
                        <Statistic title="Phòng đang ở" value={1} prefix={<WalletOutlined style={{color: '#1890ff'}} />} />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card hoverable style={{ borderRadius: '12px', borderBottom: '4px solid #52c41a' }}>
                        <Statistic title="Điểm tích lũy" value={user.points} prefix={<CheckCircleOutlined style={{color: '#52c41a'}} />} />
                    </Card>
                </Col>
                <Col span={8}>
                    <Card hoverable style={{ borderRadius: '12px', borderBottom: '4px solid #faad14' }}>
                        <Statistic title="Hạng thành viên" value={user.rank} prefix={<CrownOutlined style={{color: '#faad14'}} />} />
                    </Card>
                </Col>
            </Row>

            <Row gutter={[24, 24]}>
                {/* --- THÔNG TIN TÀI KHOẢN --- */}
                <Col span={10}>
                    <Card title="Hồ sơ cá nhân">
                        <div style={{ textAlign: 'center', marginBottom: 20 }}>
                            <Avatar size={80} icon={<UserOutlined />} style={{ backgroundColor: '#1890ff' }} />
                            <h3 style={{ marginTop: 10 }}>{user.fullName}</h3>
                            <Tag color="gold">VIP CLIENT</Tag>
                        </div>
                        <Descriptions column={1} bordered size="small">
                            <Descriptions.Item label="Email">{user.email}</Descriptions.Item>
                        </Descriptions>
                    </Card>
                </Col>

                {/* --- LỊCH SỬ --- */}
                <Col span={14}>
                    <Card title="Hoạt động">
                        <Tabs defaultActiveKey="1" items={[
                            {
                                key: '1',
                                label: (<span><HistoryOutlined /> Lịch sử thuê phòng</span>),
                                children: (
                                    <Table 
                                        size="small" 
                                        pagination={false} 
                                        dataSource={[{ key: '1', id: 'P101', status: 'Thành công' }]} 
                                        columns={[{ title: 'Mã phòng', dataIndex: 'id' }, { title: 'Trạng thái', dataIndex: 'status' }]} 
                                    />
                                )
                            }
                        ]} />
                    </Card>
                </Col>
            </Row>
        </div>
    );
};

export default GuestDashboard;