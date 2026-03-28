import axiosClient from './axios';

export const userManagementAPI = {
    getUsers: () => axiosClient.get('/UserManagement'),
    createUser: (data) => axiosClient.post('/UserManagement', data),
    updateUser: (id, data) => axiosClient.put(`/UserManagement/${id}`, data),
    toggleStatus: (id) => {
        // Gọi đúng API PUT bên Backend mà chúng ta đã làm
        return axiosClient.put(`/UserManagement/${id}/toggle-status`);
    } 
    
};