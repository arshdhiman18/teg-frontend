import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
const ADMIN_KEY = 'teg-admin-2024';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const isAdmin = localStorage.getItem('teg_admin_auth') === 'true';
    if (isAdmin) config.headers['x-admin-key'] = ADMIN_KEY;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);

export interface Product {
  _id: string;
  title: string;
  slug: string;
  section?: 'Social & Home Celebrations' | 'Signature Events';
  category: string;
  subCategory?: string;
  gender?: 'Male' | 'Female' | 'Unisex';
  price: number;
  discount: number;
  images: string[];
  budgetTag: 'Pocket' | 'Premium' | 'Luxury';
  description: string;
  includes: string[];
  excludes: string[];
  featured: boolean;
  createdAt: string;
}

export interface ProductFilters {
  category?: string;
  section?: string;
  subCategory?: string;
  gender?: string;
  budgetTag?: string;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
  search?: string;
  limit?: number;
  page?: number;
}

export interface ProductsResponse {
  success: boolean;
  total: number;
  page: number;
  pages: number;
  data: Product[];
}

export const getProducts = async (filters: ProductFilters = {}): Promise<ProductsResponse> => {
  const params: Record<string, string | number | boolean> = {};
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') params[key] = value;
  });
  const response = await api.get('/api/products', { params });
  return response.data;
};

export const getProduct = async (id: string): Promise<{ success: boolean; data: Product }> => {
  const response = await api.get(`/api/products/${id}`);
  return response.data;
};

export const createProduct = async (data: Partial<Product>): Promise<{ success: boolean; data: Product }> => {
  const response = await api.post('/api/products', data, { headers: { 'x-admin-key': ADMIN_KEY } });
  return response.data;
};

export const updateProduct = async (id: string, data: Partial<Product>): Promise<{ success: boolean; data: Product }> => {
  const response = await api.put(`/api/products/${id}`, data, { headers: { 'x-admin-key': ADMIN_KEY } });
  return response.data;
};

export const deleteProduct = async (id: string): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete(`/api/products/${id}`, { headers: { 'x-admin-key': ADMIN_KEY } });
  return response.data;
};

export const uploadImages = async (files: File[]): Promise<{ success: boolean; urls: string[] }> => {
  const formData = new FormData();
  files.forEach((file) => formData.append('images', file));
  const response = await api.post('/api/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data', 'x-admin-key': ADMIN_KEY },
    timeout: 90000,
  });
  return response.data;
};

export interface Category {
  _id: string;
  name: string;
  section: 'Social & Home Celebrations' | 'Signature Events';
  subCategories: string[];
  image: string | null;
  tagline: string;
  detail: string;
  accent: string;
  gradientFrom: string;
  gradientTo: string;
  order: number;
}

export const getCategories = async (): Promise<{ success: boolean; data: Category[] }> => {
  const response = await api.get('/api/categories');
  return response.data;
};

export const getActiveCategories = async (): Promise<{ success: boolean; data: Category[] }> => {
  const response = await api.get('/api/categories/active');
  return response.data;
};

export const createCategory = async (data: Partial<Category>): Promise<{ success: boolean; data: Category }> => {
  const response = await api.post('/api/categories', data, { headers: { 'x-admin-key': ADMIN_KEY } });
  return response.data;
};

export const updateCategory = async (id: string, data: Partial<Category>): Promise<{ success: boolean; data: Category }> => {
  const response = await api.put(`/api/categories/${id}`, data, { headers: { 'x-admin-key': ADMIN_KEY } });
  return response.data;
};

export const deleteCategory = async (id: string): Promise<{ success: boolean; message: string }> => {
  const response = await api.delete(`/api/categories/${id}`, { headers: { 'x-admin-key': ADMIN_KEY } });
  return response.data;
};

export const formatPrice = (price: number): string =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

export const getDiscountedPrice = (price: number, discount: number): number => {
  if (!discount || discount === 0) return price;
  return Math.round(price - (price * discount) / 100);
};

export const generateWhatsAppMessage = (product: Product): string => {
  const discountedPrice = getDiscountedPrice(product.price, product.discount);
  const priceStr = formatPrice(discountedPrice);
  const url = typeof window !== 'undefined' ? window.location.href : '';
  return encodeURIComponent(
    `Hi, I'm interested in this setup:\n\nName: ${product.title}\nCategory: ${product.category}\nPrice: ${priceStr}\n\nPage: ${url}\n\nPlease share more details.`
  );
};
