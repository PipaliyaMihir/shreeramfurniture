import axios from 'axios';

const API = axios.create({
  baseURL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://127.0.0.1:5001/api'
    : '/api',
  headers: { 'Content-Type': 'application/json' },
});

// Attach token to requests
API.interceptors.request.use((config) => {
  const token = sessionStorage.getItem('srf_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 errors
API.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      sessionStorage.removeItem('srf_token');
      sessionStorage.removeItem('srf_user');
      window.location.href = '/admin/login';
    }
    return Promise.reject(err);
  }
);

export default API;

// Auth
export const login = (data) => API.post('/auth/login', data);

// Products
export const getProducts = (params) => API.get('/products', { params });
export const getProduct = (id) => API.get(`/products/${id}`);
export const createProduct = (data) => API.post('/products', data);
export const updateProduct = (id, data) => API.put(`/products/${id}`, data);
export const deleteProduct = (id) => API.delete(`/products/${id}`);
export const rateProduct = (id, rating) => API.post(`/products/${id}/rate`, { rating });

// Categories
export const getCategories = () => API.get('/categories');
export const createCategory = (data) => API.post('/categories', data);
export const updateCategory = (id, data) => API.put(`/categories/${id}`, data);
export const deleteCategory = (id) => API.delete(`/categories/${id}`);

// Hero
export const getHeroSlides = () => API.get('/hero');
export const getAllHeroSlides = () => API.get('/hero/all');
export const createHeroSlide = (data) => API.post('/hero', data);
export const updateHeroSlide = (id, data) => API.put(`/hero/${id}`, data);
export const deleteHeroSlide = (id) => API.delete(`/hero/${id}`);
export const getHeroConfig = () => API.get('/hero/config');
export const updateHeroConfig = (data) => API.put('/hero/config', data);

// Upload
export const uploadImages = (formData) =>
  API.post('/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const deleteImage = (filename) => API.delete('/upload', { data: { filename } });

// Contact & Quotations
export const submitQuotation = (data) => API.post('/contact/quotation', data);
export const getEmailConfig = () => API.get('/contact/config');
export const updateEmailConfig = (data) => API.put('/contact/config', data);
export const uploadQuotationPdf = (formData) =>
  API.post('/contact/config/pdf', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const getQuotations = () => API.get('/contact/quotations');
export const deleteQuotation = (id) => API.delete(`/contact/quotations/${id}`);
