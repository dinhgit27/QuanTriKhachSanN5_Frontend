import axiosClient from './axios';

export const roleAPI = {
    // Lấy danh sách tất cả các Role (Dùng cho bảng và Dropdown)
    getRoles: () => {
        return axiosClient.get('/Roles');
    },

    // Lấy danh sách toàn bộ từ điển Quyền (Permissions) của hệ thống
    getPermissions: () => {
        return axiosClient.get('/Roles/permissions');
    },

    // Lấy danh sách các quyền ĐANG ĐƯỢC GÁN cho một Role cụ thể
    getRolePermissions: (roleId) => {
        return axiosClient.get(`/Roles/${roleId}/permissions`);
    },

    // Lưu/Cập nhật cấu hình phân quyền mới cho một Role
    assignPermissions: (data) => {
        // data thường có dạng: { roleId: 1, permissionIds: [1, 2, 5] }
        return axiosClient.post('/Roles/assign-permissions', data);
    }
};