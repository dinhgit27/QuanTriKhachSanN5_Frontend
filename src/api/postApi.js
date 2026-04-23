import axiosClient from './axios';

export const postAPI = {
    // ---- PHẦN DANH MỤC (CATEGORIES) ----
    getCategories: () => axiosClient.get('/Categories'),
    createCategory: (data) => axiosClient.post('/Categories', data),
    deleteCategory: (id) => axiosClient.delete(`/Categories/${id}`),

    // ---- PHẦN BÀI VIẾT (POSTS) ----
    getPosts: () => axiosClient.get('/Posts'),
    getPostById: (id) => axiosClient.get(`/Posts/${id}`),
    createPost: (data) => axiosClient.post('/Posts', data),
    deletePost: (id) => axiosClient.delete(`/Posts/${id}`),
};