export interface User {
  id: string;
  username: string;
  name: string;
  role: "admin" | "staff";
}

export interface Product {
  id: string;
  name: string;
  category: string;
  unit: string;
  price: number;
  stock: number;
  minStock: number;
  expiryDate: string;
  supplierId: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact: string;
  email: string;
  address: string;
}

export interface Transaction {
  id: string;
  productId: string;
  productName: string;
  type: "stock-in" | "stock-out";
  quantity: number;
  date: string;
  performedBy: string;
  notes: string;
}

export interface DashboardStats {
  totalProducts: number;
  lowStockItems: number;
  expiringItems: number;
  todayTransactions: number;
}
