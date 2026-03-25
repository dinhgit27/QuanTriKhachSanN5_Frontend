import React, { useState } from "react";
import { Form, Input, Button, Card, Typography, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useNavigate, Link } from "react-router-dom";
import { useAdminAuthStore } from "../store/adminAuthStore";
import { authAPI } from "../api/authApi";
import { jwtDecode } from "jwt-decode";

const { Title, Text } = Typography;

const LoginPage = () => {
  const navigate = useNavigate();
  const setAuth = useAdminAuthStore((state) => state.setAuth);
  const [loading, setLoading] = useState(false);

  // Hàm này tự động chạy khi người dùng điền đúng form và bấm Submit
  const onFinish = async (values) => {
    setLoading(true); // Bật hiệu ứng xoay xoay ở nút Đăng nhập
    try {
      const response = await authAPI.login(values);

      // ⚠️ Sửa chỗ destruct
      const { token, user, permissions } = response.data;

      // 2. Decode token
      const decoded = jwtDecode(token);

      const roles =
        decoded[
          "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
        ] || [];

      // 3. Lưu localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      setAuth(token, user, permissions);

      message.success("Đăng nhập thành công! Chào mừng trở lại.");

      // 4. CHUYỂN HƯỚNG THÔNG MINH THEO CHỨC VỤ
      // Kiểm tra xem backend trả về tên chức vụ ở trường nào (thường là roleName hoặc role)
      const role = user.roleName || user.role;

      if (role === "Admin") {
        navigate("/admin/dashboard");
      } else if (role === "Receptionist" || role === "Lễ tân") {
        navigate("/receptionist/dashboard");
      } else if (role === "Housekeeper" || role === "Lao công") {
        navigate("/housekeeper/dashboard");
      } else {
        navigate("/guest/dashboard"); // Khách hàng hoặc chưa có quyền
      }
    } catch (error) {
      // Nếu lỗi (Sai pass, tài khoản khóa...), hiển thị thông báo lỗi
      const errorMsg =
        error.response?.data?.message || "Tài khoản hoặc mật khẩu không đúng!";
      message.error(errorMsg);
    } finally {
      setLoading(false); // Tắt hiệu ứng xoay xoay
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        background: "linear-gradient(135deg, #1890ff 0%, #8A2BE2 100%)",
      }}
    >
      <Card
        style={{
          width: 400,
          boxShadow: "0 10px 25px rgba(0,0,0,0.2)",
          borderRadius: "12px",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <Title level={2} style={{ color: "#1890ff", marginBottom: 0 }}>
            HOTEL ERP
          </Title>
          <Text type="secondary">Hệ thống quản trị nội bộ</Text>
        </div>

        <Form
          name="login_form"
          layout="vertical"
          onFinish={onFinish}
          size="large"
        >
          {/* Ô nhập Email */}
          <Form.Item
            name="email"
            rules={[
              { required: true, message: "Vui lòng nhập Email!" },
              { type: "email", message: "Định dạng Email không hợp lệ!" },
            ]}
          >
            <Input
              prefix={<UserOutlined style={{ color: "#bfbfbf" }} />}
              placeholder="Email đăng nhập"
            />
          </Form.Item>

          {/* Ô nhập Mật khẩu */}
          <Form.Item
            name="password"
            rules={[{ required: true, message: "Vui lòng nhập Mật khẩu!" }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: "#bfbfbf" }} />}
              placeholder="Mật khẩu"
            />
          </Form.Item>

          {/* Nút Đăng nhập */}
          <Form.Item style={{ marginTop: "30px", marginBottom: 0 }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              style={{ height: "45px", fontSize: "16px" }}
            >
              Đăng Nhập
            </Button>
          </Form.Item>

          {/* THÊM KHU VỰC LINK CHUYỂN TRANG Ở ĐÂY NÈ ĐỈNH */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "16px",
              fontSize: "14px",
            }}
          >
            <Link to="/forgot-password" style={{ color: "#1890ff" }}>
              Quên mật khẩu?
            </Link>
            <span style={{ color: "#8c8c8c" }}>
              Chưa có tài khoản?{" "}
              <Link
                to="/register"
                style={{ fontWeight: "bold", color: "#1890ff" }}
              >
                Đăng ký ngay
              </Link>
            </span>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;
