import axiosClient from './axios';

export const userManagementAPI = {
    // Lấy danh sách user (có phân trang, tìm kiếm)
    getUsers: (params) => {
        return axiosClient.get('/UserManagement', { params });
    },

    // Tạo mới tài khoản
    createUser: (data) => {
        return axiosClient.post('/UserManagement', data);
    },

    // Đổi vai trò (Role)
    changeRole: (id, newRoleId) => {
        return axiosClient.put(`/UserManagement/${id}/change-role`, { newRoleId });
    },

    // Vô hiệu hóa tài khoản (Soft Delete)
    deleteUser: (id) => {
        return axiosClient.delete(`/UserManagement/${id}`);
    },

    // Khôi phục tài khoản (Unlock)
    unlockUser: (id) => {
        return axiosClient.put(`/UserManagement/${id}/unlock`);
    }
};