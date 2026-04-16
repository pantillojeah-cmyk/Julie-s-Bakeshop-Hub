import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getProducts, getRawMaterials, getTransactions, Product, RawMaterial, Transaction } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Printer, Package, ArrowLeftRight, AlertTriangle, Loader2 } from "lucide-react";

type ReportType = "inventory" | "transactions" | "low-stock";

const ReportsPage = () => {
  const [reportType, setReportType] = useState<ReportType>("inventory");

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
  });

  const { data: rawMaterials = [], isLoading: rawLoading } = useQuery({
    queryKey: ["raw_materials"],
    queryFn: getRawMaterials,
  });

  const { data: transactions = [], isLoading: txLoading } = useQuery({
    queryKey: ["transactions"],
    queryFn: getTransactions,
  });

  if (productsLoading || rawLoading || txLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const lowStockProducts = products.filter(p => p.stock <= p.min_stock);
  const lowStockIngredients = rawMaterials.filter(rm => rm.stock <= rm.min_stock);

  const handlePrint = () => window.print();

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between print:hidden">
        <div className="flex gap-2 flex-wrap">
          <Button variant={reportType === "inventory" ? "default" : "secondary"} size="sm" onClick={() => setReportType("inventory")}>
            <Package className="h-4 w-4 mr-2" />Inventory
          </Button>
          <Button variant={reportType === "transactions" ? "default" : "secondary"} size="sm" onClick={() => setReportType("transactions")}>
            <ArrowLeftRight className="h-4 w-4 mr-2" />Transactions
          </Button>
          <Button variant={reportType === "low-stock" ? "default" : "secondary"} size="sm" onClick={() => setReportType("low-stock")}>
            <AlertTriangle className="h-4 w-4 mr-2" />Low Stock
          </Button>
        </div>
        <Button variant="secondary" onClick={handlePrint}>
          <Printer className="h-4 w-4 mr-2" />Print Report
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {reportType === "inventory" && "Inventory Summary Report"}
            {reportType === "transactions" && "Transaction History Report"}
            {reportType === "low-stock" && "Low Stock Alert Report"}
          </CardTitle>
          <p className="text-sm text-muted-foreground">Generated: {new Date().toLocaleDateString()}</p>
        </CardHeader>
        <CardContent className="p-0 overflow-auto">
          {reportType === "inventory" && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Stock</TableHead>
                  <TableHead className="text-right">Price</TableHead>
                  <TableHead className="text-right">Value</TableHead>
                  <TableHead>Expiry</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map(p => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>{p.category} (Product)</TableCell>
                    <TableCell className="text-right">{p.stock} {p.unit}</TableCell>
                    <TableCell className="text-right">₱{Number(p.price).toFixed(2)}</TableCell>
                    <TableCell className="text-right">₱{(p.stock * p.price).toFixed(2)}</TableCell>
                    <TableCell>{new Date(p.expiry_date).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
                {rawMaterials.map(rm => (
                  <TableRow key={rm.id}>
                    <TableCell className="font-medium">{rm.name}</TableCell>
                    <TableCell>{rm.category} (Ingredient)</TableCell>
                    <TableCell className="text-right">{rm.stock} {rm.unit}</TableCell>
                    <TableCell className="text-right">N/A</TableCell>
                    <TableCell className="text-right">N/A</TableCell>
                    <TableCell>{new Date(rm.expiry_date).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="font-bold">
                  <TableCell colSpan={4} className="text-right">Total Inventory Value:</TableCell>
                  <TableCell className="text-right">₱{products.reduce((s, p) => s + p.stock * p.price, 0).toFixed(2)}</TableCell>
                  <TableCell />
                </TableRow>
              </TableBody>
            </Table>
          )}

          {reportType === "transactions" && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="text-right">Qty</TableHead>
                  <TableHead>By</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map(t => (
                  <TableRow key={t.id}>
                    <TableCell>{new Date(t.created_at).toLocaleString()}</TableCell>
                    <TableCell className="font-medium">{t.product_name || t.raw_material_name}</TableCell>
                    <TableCell>
                      <Badge variant={t.type === "stock-in" ? "default" : "secondary"}>
                        {t.type === "stock-in" ? "IN" : "OUT"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{t.quantity}</TableCell>
                    <TableCell>{t.performed_by}</TableCell>
                    <TableCell className="text-muted-foreground text-sm">{t.notes}</TableCell>
                  </TableRow>
                ))}
                {transactions.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No transactions available.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}

          {reportType === "low-stock" && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="text-right">Current Stock</TableHead>
                  <TableHead className="text-right">Min Stock</TableHead>
                  <TableHead className="text-right">Deficit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {lowStockProducts.map(p => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>{p.category} (Product)</TableCell>
                    <TableCell className="text-right">{p.stock} {p.unit}</TableCell>
                    <TableCell className="text-right">{p.min_stock}</TableCell>
                    <TableCell className="text-right text-destructive font-medium">-{p.min_stock - p.stock}</TableCell>
                  </TableRow>
                ))}
                {lowStockIngredients.map(rm => (
                  <TableRow key={rm.id}>
                    <TableCell className="font-medium">{rm.name}</TableCell>
                    <TableCell>{rm.category} (Ingredient)</TableCell>
                    <TableCell className="text-right">{rm.stock} {rm.unit}</TableCell>
                    <TableCell className="text-right">{rm.min_stock}</TableCell>
                    <TableCell className="text-right text-destructive font-medium">-{rm.min_stock - rm.stock}</TableCell>
                  </TableRow>
                ))}
                {lowStockProducts.length === 0 && lowStockIngredients.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No low stock items.</TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsPage;
