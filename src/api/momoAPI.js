import axiosClient from "./axios";

const momoAPI = {
    getVietQRByInvoiceId: (invoiceId) => axiosClient.get(`/VietQR/${invoiceId}`),
};

export default momoAPI;

