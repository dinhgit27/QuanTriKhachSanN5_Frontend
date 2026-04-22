import React, { useState } from "react";
import { Card, InputNumber, Button, message, Typography, Divider, QRCode } from "antd";
import invoiceAPI from "../../api/invoiceAPI";

const { Title, Text } = Typography;

const getMomoQRCodeValue = (amount, bookingCode) => {
    const momoPhone = import.meta.env.VITE_MOMO_PHONE || "0901234567";
    const momoMerchantName = import.meta.env.VITE_MOMO_NAME || "IT CODE HOTEL";
    const payloadNote = `Thanh toan hoa don ${bookingCode}`;
    const finalAmount = Math.round(Number(amount) || 0);

    return `2|0|${momoMerchantName}|${momoPhone}||0|0|${finalAmount}|${payloadNote}`;
};

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
            message.error("Không xem được hóa đơn!");
        } finally {
            setLoading(false);
        }
    };

    // 🧾 Checkout thật
    const handleCheckout = async () => {
        try {
            setLoading(true);
            await invoiceAPI.checkout(bookingId);

            message.success("Checkout thành công!");
            setPreview(null);
        } catch (err) {
            message.error(err.response?.data?.message || "Lỗi checkout!");
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
                        <QRCode value={getMomoQRCodeValue(preview.finalTotal, preview.bookingCode)} size={160} style={{ margin: "auto" }} />
                        <Text type="secondary" style={{ display: 'block', marginTop: 8 }}>Momo: {import.meta.env.VITE_MOMO_PHONE || '090 123 4567'} ({import.meta.env.VITE_MOMO_NAME || 'IT CODE HOTEL'})</Text>
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