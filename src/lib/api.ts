/**
 * Typed API client for the local Express/PostgreSQL backend.
 * Import and use these functions instead of querying Supabase directly
 * when working with the IMS Julies_db database.
 *
 * Usage:
 *   import { getProducts, createProduct } from '@/lib/api';
 */

const BASE_URL = import.meta.env.PROD ? '' : (import.meta.env.VITE_API_URL || 'http://localhost:3001');

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const url = `${BASE_URL}${path}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', ...options?.headers },
      ...options,
    });
    clearTimeout(timeoutId);
    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({}));
      console.error(`API Error [${res.status}] ${url}:`, errorBody);
      throw new Error(errorBody.error || `HTTP error! status: ${res.status}`);
    }
    return res.json() as Promise<T>;
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error("Request timed out. The server might be busy or unreachable. Please try again.");
    }
    if (err.name === 'TypeError' && err.message === 'Failed to fetch') {
      throw new Error("Database server unreachable. Please make sure the backend is running (npm run dev:all).");
    }
    throw err;
  }
}

// ─── Types ────────────────────────────────────────────────────────────────────

export interface Product {
  id: string;
  name: string;
  category: string;
  unit: string;
  price: number;
  stock: number;
  min_stock: number;
  expiry_date: string;
  supplier_id?: string | null;
  supplier_name?: string;
  created_at: string;
  updated_at: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  email: string;
  address: string;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  product_id: string;
  type: 'stock-in' | 'stock-out';
  quantity: number;
  performed_by: string;
  notes: string | null;
  created_at: string; // This is the UTC date from server
  product_name?: string;
  product_category?: string;
  performed_by_name?: string;
}

export interface Stats {
  totalProducts: number;
  lowStockItems: number;
  expiredItems: number;
  expiringSoon: number;
  todayTransactions: number;
}

export interface User {
  id: string;
  username: string;
  name: string;
  role: 'admin' | 'staff';
  created_at: string;
  updated_at: string;
}

// ─── Products ─────────────────────────────────────────────────────────────────

export const getProducts = () =>
  request<Product[]>('/api/products');

export const getProduct = (id: string) =>
  request<Product>(`/api/products/${id}`);

export const createProduct = (data: Omit<Product, 'id' | 'created_at' | 'updated_at' | 'supplier_name'>) =>
  request<Product>('/api/products', { method: 'POST', body: JSON.stringify(data) });

export const updateProduct = (id: string, data: Partial<Omit<Product, 'id' | 'created_at' | 'updated_at' | 'supplier_name'>>) =>
  request<Product>(`/api/products/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const deleteProduct = (id: string) =>
  request<{ message: string }>(`/api/products/${id}`, { method: 'DELETE' });

// ─── Suppliers ────────────────────────────────────────────────────────────────

export const getSuppliers = () =>
  request<Supplier[]>('/api/suppliers');

export const getSupplier = (id: string) =>
  request<Supplier>(`/api/suppliers/${id}`);

export const createSupplier = (data: Omit<Supplier, 'id' | 'created_at' | 'updated_at'>) =>
  request<Supplier>('/api/suppliers', { method: 'POST', body: JSON.stringify(data) });

export const updateSupplier = (id: string, data: Partial<Omit<Supplier, 'id' | 'created_at' | 'updated_at'>>) =>
  request<Supplier>(`/api/suppliers/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const deleteSupplier = (id: string) =>
  request<{ message: string }>(`/api/suppliers/${id}`, { method: 'DELETE' });

// ─── Transactions ─────────────────────────────────────────────────────────────

export const getTransactions = () =>
  request<Transaction[]>('/api/transactions');

export const getStats = () =>
  request<Stats>('/api/stats');

export const getProductTransactions = (productId: string) =>
  request<Transaction[]>(`/api/transactions/product/${productId}`);

export const createTransaction = (data: Pick<Transaction, 'product_id' | 'type' | 'quantity' | 'performed_by' | 'notes'>) =>
  request<Transaction>('/api/transactions', { method: 'POST', body: JSON.stringify(data) });

// ─── Users ────────────────────────────────────────────────────────────────────

export const getUsers = () =>
  request<User[]>('/api/users');

export const loginUser = (username: string, password: string) =>
  request<{ user: User }>('/api/users/login', {
    method: 'POST',
    body: JSON.stringify({ username, password }),
  });

export const createUser = (data: Omit<User, 'id' | 'created_at' | 'updated_at'> & { password: string }) =>
  request<User>('/api/users', { method: 'POST', body: JSON.stringify(data) });

export const updateUser = (id: string, data: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>) =>
  request<User>(`/api/users/${id}`, { method: 'PUT', body: JSON.stringify(data) });

export const deleteUser = (id: string) =>
  request<{ message: string }>(`/api/users/${id}`, { method: 'DELETE' });

// ─── Health check ─────────────────────────────────────────────────────────────

export const checkHealth = () =>
  request<{ status: string; database: string; time: string }>('/api/health');
