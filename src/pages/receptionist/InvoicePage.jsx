import React from "react";
import { Button } from "antd";

const InvoicePage = () => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="invoice">
      <h1>HÓA ĐƠN KHÁCH SẠN</h1>
      <p>Khách hàng: Nguyễn Văn A</p>

      <table border="1">
        <tr>
          <th>Mục</th>
          <th>Số tiền</th>
        </tr>
        <tr>
          <td>Tiền phòng</td>
          <td>1,000,000</td>
        </tr>
        <tr>
          <td>Minibar</td>
          <td>50,000</td>
        </tr>
      </table>

      <h2>Tổng: 1,050,000</h2>

      <Button onClick={handlePrint}>In hóa đơn</Button>
    </div>
  );
};

export default InvoicePage;