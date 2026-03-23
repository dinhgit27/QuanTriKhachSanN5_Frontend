import React, { useEffect, useState } from 'react';
import { Table, Tag, Space, Button, Card, Input, Modal, Form, Select, message } from 'antd';
import { userManagementAPI } from '../api/userManagement';
import { roleAPI } from '../api/roleApi';

const UserListPage = () => {
    const [form] = Form.useForm();
    const [users, setUsers] = useState([]);
    const [roles, setRoles] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // 1. Lấy dữ liệu ban đầu
    const initData = async () => {
        setLoading(true);
        try {
            // FIX LỖI: Cần await cho cái Promise.all để nó lấy xong dữ liệu rồi mới chạy tiếp
            const [userRes, roleRes] = await Promise.all([
                userManagementAPI.getUsers(),
                roleAPI.getRoles()
            ]);
            
            // Xử lý an toàn: Nếu API trả về null thì gán mảng rỗng để Table không bị lỗi
            setUsers(userRes?.data || []);
            setRoles(roleRes?.data || []);
        } catch (error) {
            message.error("Lỗi tải dữ liệu từ máy chủ!");
            console.error("Lỗi gọi API:", error); // In ra console để dễ debug nếu có lỗi
        } finally {
            setLoading(false);
        }
    };

    // Chạy hàm lấy dữ liệu khi vừa mở trang
    useEffect(() => { 
        initData(); 
    }, []);

    // 2. Xử lý Thêm mới Người dùng
    const handleCreateUser = async (values) => {
        try {
            await userManagementAPI.createUser(values);
            message.success("Tạo tài khoản thành công!");
            setIsModalOpen(false);
            form.resetFields(); // Xóa trắng form
            initData(); // Refresh lại danh sách Table
        } catch (error) {
            message.error(error.response?.data?.message || "Lỗi khi tạo user");
        }
    };

    // 3. Cấu hình các cột của Table
    const columns = [
        { 
            title: 'Họ tên', 
            dataIndex: 'fullName', 
            key: 'fullName' 
        },
        { 
            title: 'Email', 
            dataIndex: 'email', 
            key: 'email' 
        },
        { 
            title: 'Vai trò', 
            dataIndex: 'roleName', 
            key: 'roleName',
            render: (role) => <Tag color="blue">{role}</Tag>
        },
        { 
            title: 'Trạng thái', 
            dataIndex: 'isActive', 
            key: 'isActive',
            render: (active) => <Tag color={active ? 'green' : 'red'}>{active ? 'Active' : 'Locked'}</Tag>
        },
        {
            title: 'Thao tác',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Button type="link">Sửa</Button>
                    <Button type="link" danger>Khóa</Button>
                </Space>
            )
        }
    ];

    return (
        <Card title="Quản lý Nhân sự" extra={
            <Button type="primary" onClick={() => setIsModalOpen(true)}>Thêm Nhân Viên</Button>
        }>
            {/* Bộ lọc tìm kiếm */}
            <div style={{ marginBottom: 16 }}>
                <Input.Search 
                    placeholder="Tìm theo tên hoặc email..." 
                    style={{ width: 300 }} 
                />
            </div>

            {/* Bảng dữ liệu */}
            <Table 
                columns={columns} 
                dataSource={users} 
                rowKey="id" 
                loading={loading}
                pagination={{ pageSize: 10 }}
            />

            {/* Modal Thêm mới */}
            <Modal 
                title="Tạo Tài Khoản Nhân Viên" 
                open={isModalOpen} 
                onOk={() => form.submit()} 
                onCancel={() => setIsModalOpen(false)}
                okText="Tạo mới"
                cancelText="Hủy bỏ"
            >
                <Form form={form} layout="vertical" onFinish={handleCreateUser}>
                    <Form.Item 
                        name="fullName" 
                        label="Họ tên" 
                        rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
                    >
                        <Input placeholder="Nhập họ và tên nhân viên" />
                    </Form.Item>
                    
                    <Form.Item 
                        name="email" 
                        label="Email" 
                        rules={[
                            { required: true, message: 'Vui lòng nhập email!' },
                            { type: 'email', message: 'Email không hợp lệ!' }
                        ]}
                    >
                        <Input placeholder="Nhập địa chỉ email" />
                    </Form.Item>
                    
                    <Form.Item 
                        name="roleId" 
                        label="Vai trò" 
                        rules={[{ required: true, message: 'Vui lòng chọn vai trò!' }]}
                    >
                        {/* Biến mảng roles thành dạng { label, value } cho Select của Ant Design */}
                        <Select 
                            placeholder="Chọn vai trò cho nhân viên"
                            options={roles.map(r => ({ label: r.name, value: r.id }))} 
                        />
                    </Form.Item>
                </Form>
            </Modal>
        </Card>
    );
};

export default UserListPage;