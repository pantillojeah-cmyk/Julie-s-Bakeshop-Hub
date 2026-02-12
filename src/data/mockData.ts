import { Product, Supplier, Transaction, DashboardStats, User } from "@/types/inventory";

export const mockUsers: User[] = [
  { id: "1", username: "admin", name: "Admin User", role: "admin" },
  { id: "2", username: "staff1", name: "Maria Santos", role: "staff" },
];

export const mockProducts: Product[] = [
  { id: "1", name: "Pandesal", category: "Bread", unit: "pcs", price: 5, stock: 250, minStock: 50, expiryDate: "2026-02-18", supplierId: "1" },
  { id: "2", name: "Ensaymada", category: "Pastry", unit: "pcs", price: 15, stock: 80, minStock: 30, expiryDate: "2026-02-16", supplierId: "1" },
  { id: "3", name: "Monay", category: "Bread", unit: "pcs", price: 5, stock: 120, minStock: 40, expiryDate: "2026-02-19", supplierId: "1" },
  { id: "4", name: "Spanish Bread", category: "Bread", unit: "pcs", price: 8, stock: 15, minStock: 30, expiryDate: "2026-02-15", supplierId: "2" },
  { id: "5", name: "Flour (All Purpose)", category: "Ingredient", unit: "kg", price: 55, stock: 45, minStock: 20, expiryDate: "2026-06-01", supplierId: "2" },
  { id: "6", name: "Sugar", category: "Ingredient", unit: "kg", price: 65, stock: 8, minStock: 15, expiryDate: "2026-08-01", supplierId: "2" },
  { id: "7", name: "Butter", category: "Ingredient", unit: "kg", price: 280, stock: 5, minStock: 10, expiryDate: "2026-03-15", supplierId: "3" },
  { id: "8", name: "Ube Cake", category: "Cake", unit: "whole", price: 350, stock: 12, minStock: 5, expiryDate: "2026-02-14", supplierId: "1" },
  { id: "9", name: "Cheese Roll", category: "Pastry", unit: "pcs", price: 12, stock: 60, minStock: 25, expiryDate: "2026-02-17", supplierId: "1" },
  { id: "10", name: "Egg", category: "Ingredient", unit: "tray", price: 220, stock: 3, minStock: 5, expiryDate: "2026-02-28", supplierId: "3" },
];

export const mockSuppliers: Supplier[] = [
  { id: "1", name: "Pitogo Bakery Supplies", contact: "09171234567", email: "pitogo.supplies@email.com", address: "Pitogo, Zamboanga del Sur" },
  { id: "2", name: "ZDS Flour Trading", contact: "09189876543", email: "zdsflour@email.com", address: "Pagadian City, Zamboanga del Sur" },
  { id: "3", name: "Metro Dairy Products", contact: "09201112233", email: "metrodairy@email.com", address: "Cagayan de Oro City" },
];

export const mockTransactions: Transaction[] = [
  { id: "1", productId: "1", productName: "Pandesal", type: "stock-in", quantity: 200, date: "2026-02-12", performedBy: "Maria Santos", notes: "Morning delivery" },
  { id: "2", productId: "1", productName: "Pandesal", type: "stock-out", quantity: 150, date: "2026-02-12", performedBy: "Maria Santos", notes: "Sold" },
  { id: "3", productId: "2", productName: "Ensaymada", type: "stock-in", quantity: 50, date: "2026-02-12", performedBy: "Admin User", notes: "Batch production" },
  { id: "4", productId: "5", productName: "Flour (All Purpose)", type: "stock-in", quantity: 25, date: "2026-02-11", performedBy: "Admin User", notes: "Supplier delivery" },
  { id: "5", productId: "6", productName: "Sugar", type: "stock-out", quantity: 10, date: "2026-02-11", performedBy: "Maria Santos", notes: "Used in production" },
  { id: "6", productId: "4", productName: "Spanish Bread", type: "stock-out", quantity: 45, date: "2026-02-11", performedBy: "Maria Santos", notes: "Sold" },
  { id: "7", productId: "8", productName: "Ube Cake", type: "stock-in", quantity: 8, date: "2026-02-10", performedBy: "Admin User", notes: "Fresh batch" },
  { id: "8", productId: "9", productName: "Cheese Roll", type: "stock-out", quantity: 30, date: "2026-02-10", performedBy: "Maria Santos", notes: "Sold" },
];

export const getDashboardStats = (): DashboardStats => {
  const totalProducts = mockProducts.length;
  const lowStockItems = mockProducts.filter(p => p.stock <= p.minStock).length;
  const today = new Date().toISOString().split("T")[0];
  const expiringItems = mockProducts.filter(p => {
    const diff = new Date(p.expiryDate).getTime() - new Date(today).getTime();
    return diff <= 3 * 24 * 60 * 60 * 1000 && diff >= 0;
  }).length;
  const todayTransactions = mockTransactions.filter(t => t.date === "2026-02-12").length;
  return { totalProducts, lowStockItems, expiringItems, todayTransactions };
};
