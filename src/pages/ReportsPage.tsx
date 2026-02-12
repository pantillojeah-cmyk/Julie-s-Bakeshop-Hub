import { useState } from "react";
import { mockProducts, mockTransactions } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Printer, Package, ArrowLeftRight, AlertTriangle } from "lucide-react";

type ReportType = "inventory" | "transactions" | "low-stock";

const ReportsPage = () => {
  const [reportType, setReportType] = useState<ReportType>("inventory");

  const handlePrint = () => window.print();

  const lowStock = mockProducts.filter(p => p.stock <= p.minStock);

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
                {mockProducts.map(p => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>{p.category}</TableCell>
                    <TableCell className="text-right">{p.stock} {p.unit}</TableCell>
                    <TableCell className="text-right">₱{p.price.toFixed(2)}</TableCell>
                    <TableCell className="text-right">₱{(p.stock * p.price).toFixed(2)}</TableCell>
                    <TableCell>{p.expiryDate}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="font-bold">
                  <TableCell colSpan={4} className="text-right">Total Inventory Value:</TableCell>
                  <TableCell className="text-right">₱{mockProducts.reduce((s, p) => s + p.stock * p.price, 0).toFixed(2)}</TableCell>
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
                {mockTransactions.map(t => (
                  <TableRow key={t.id}>
                    <TableCell>{t.date}</TableCell>
                    <TableCell className="font-medium">{t.productName}</TableCell>
                    <TableCell>
                      <Badge variant={t.type === "stock-in" ? "default" : "secondary"}>
                        {t.type === "stock-in" ? "IN" : "OUT"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{t.quantity}</TableCell>
                    <TableCell>{t.performedBy}</TableCell>
                    <TableCell className="text-muted-foreground">{t.notes}</TableCell>
                  </TableRow>
                ))}
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
                {lowStock.map(p => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell>{p.category}</TableCell>
                    <TableCell className="text-right">{p.stock} {p.unit}</TableCell>
                    <TableCell className="text-right">{p.minStock}</TableCell>
                    <TableCell className="text-right text-destructive font-medium">-{p.minStock - p.stock}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportsPage;
