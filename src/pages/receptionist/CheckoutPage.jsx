import React, { useState } from "react";
import { Card, InputNumber, Button, Typography, Divider, QRCode } from "antd";
import invoiceAPI from "../../api/invoiceAPI";
import { auditLogger } from "../../utils/auditLogger";

const { Title, Text } = Typography;

const CheckoutPage = () => {
    const [bookingId, setBookingId] = useState(1);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);

    // 🔍 Xem trước hóa đơn
    const handlePreview = async () => {
        try {
            setLoading(true);
            const res = await invoiceAPI.preview(bookingId);
            setPreview(res.data);
        } catch (err) {
            auditLogger.error("Không xem được hóa đơn!", { module: "Thanh Toán", objectName: `Booking #${bookingId}` });
        } finally {
            setLoading(false);
        }
    };

    // 🧾 Checkout thật
    const handleCheckout = async () => {
        try {
            setLoading(true);
            await invoiceAPI.checkout(bookingId);

            auditLogger.success("Checkout thành công!", { 
                actionType: "CHECKOUT", 
                module: "Thanh Toán", 
                objectName: `Booking #${bookingId}`,
                description: `Checkout thành công cho đơn đặt phòng ID: ${bookingId}`
            });
            setPreview(null);
        } catch (err) {
            auditLogger.error(err.response?.data?.message || "Lỗi checkout!", { module: "Thanh Toán", objectName: `Booking #${bookingId}` });
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card style={{ maxWidth: 700, margin: "auto" }}>
            <Title level={3}>Trả phòng & Hóa đơn</Title>

            <div style={{ marginBottom: 10 }}>
                Booking ID:
                <InputNumber
                    style={{ width: "100%" }}
                    value={bookingId}
                    onChange={setBookingId}
                />
            </div>

            <Button type="primary" onClick={handlePreview} loading={loading} block>
                Xem trước hóa đơn
            </Button>

            {preview && (
                <>
                    <Divider />

                    <Text strong>Khách: {preview.guestName}</Text>
                    <br />
                    <Text>Mã đơn: {preview.bookingCode}</Text>

                    <Divider />

                    <Text>Tiền phòng: {preview.totalRoomAmount.toLocaleString()} đ</Text>
                    <br />
                    <Text>Dịch vụ + Đền bù: {preview.totalServiceAmount.toLocaleString()} đ</Text>
                    <br />
                    <Text>Thuế: {preview.taxAmount.toLocaleString()} đ</Text>

                    <Divider />

                    <Title level={4}>
                        Tổng: {preview.finalTotal.toLocaleString()} đ
                    </Title>

                    <div style={{ textAlign: "center", margin: "20px 0" }}>
                        <Title level={5}>Quét mã Momo để thanh toán</Title>
                        <QRCode value={`2|99|0901234567|TEN_KHACH_SAN||0|0|${preview.finalTotal}|Thanh toan hoa don ${preview.bookingCode}`} size={160} style={{ margin: "auto" }} />
                        <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>Momo: 090 123 4567 (Tên Khách Sạn)</Text>
                    </div>

                    <Text type="secondary">{preview.note}</Text>

                    <Divider />

                    <Button
                        type="primary"
                        danger
                        onClick={handleCheckout}
                        loading={loading}
                        block
                    >
                        Xác nhận Checkout & Xuất hóa đơn
                    </Button>
                </>
            )}
        </Card>
    );
};

export default CheckoutPage;