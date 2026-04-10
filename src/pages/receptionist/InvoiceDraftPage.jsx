import React, { useState } from "react";
import { Input, Button, Card } from "antd";
import  invoiceAPI  from "../../api/invoiceAPI";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";

const InvoiceDraftPage = () => {
  const navigate = useNavigate();
  const { bookingId } = useParams();
  const [roomPrice, setRoomPrice] = useState(1000000);
  const [deposit, setDeposit] = useState(0);
  const [compensation, setCompensation] = useState([]);
  const [minibar, setMinibar] = useState([]);
  const [discount, setDiscount] = useState(0);
  const totalCompensation = compensation.reduce((sum, i) => sum + i.amount, 0);
  const totalMinibar = minibar.reduce((sum, i) => sum + i.amount, 0);

  const total =
    roomPrice +
    totalCompensation +
    totalMinibar -
    (roomPrice * discount) / 100;

  const handleCreateInvoice = async () => {
    try {
      const response = await invoiceAPI.create({
        roomPrice,
        deposit,
        compensation,
        minibar,
        discount,
      });

      // 🔥 lấy id hóa đơn trả về từ backend
      const invoiceId = response.data.id;

      // 👉 chuyển sang trang hóa đơn
      navigate(`/receptionist/invoice/${invoiceId}`);
    } catch (error) {
      console.error("Lỗi tạo hóa đơn:", error);
    }
  };
  return (
    <Card title="Tạm tính hóa đơn">
      <p>Tiền phòng: {roomPrice}</p>

      <Button onClick={() => setDeposit(roomPrice * 0.5)}>
        Tạm tính đặt cọc 50%
      </Button>

      <p>Đặt cọc: {deposit}</p>

      {/* Đền bù */}
      <h3>Đền bù</h3>
      <Button
        onClick={() =>
          setCompensation([...compensation, { name: "Vỡ ly", amount: 50000 }])
        }
      >
        Thêm đền bù
      </Button>

      {/* Minibar */}
      <h3>Minibar</h3>
      <Button
        onClick={() =>
          setMinibar([...minibar, { name: "Snack", amount: 20000 }])
        }
      >
        Thêm minibar
      </Button>

      {/* Voucher */}
      <h3>Voucher (%)</h3>
      <Input
        type="number"
        onChange={(e) => setDiscount(Number(e.target.value))}
      />

      <h2>Tổng tiền: {total}</h2>

      <Button type="primary" onClick={handleCreateInvoice}>
        Tạo hóa đơn
      </Button>
    </Card>
  );
};

export default InvoiceDraftPage;