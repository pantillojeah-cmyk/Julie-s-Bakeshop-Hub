import { useState } from "react";
import { mockProducts, mockTransactions } from "@/data/mockData";
import { Product, Transaction } from "@/types/inventory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowDownCircle, ArrowUpCircle, Plus } from "lucide-react";

const InventoryPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [txType, setTxType] = useState<"stock-in" | "stock-out">("stock-in");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [qty, setQty] = useState("");
  const [notes, setNotes] = useState("");
  const [filter, setFilter] = useState<"all" | "stock-in" | "stock-out">("all");

  const handleTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;
    const quantity = Number(qty);
    if (quantity <= 0) { toast({ title: "Invalid quantity", variant: "destructive" }); return; }
    if (txType === "stock-out" && quantity > product.stock) {
      toast({ title: "Insufficient stock", variant: "destructive" });
      return;
    }

    const newTx: Transaction = {
      id: Date.now().toString(),
      productId: product.id,
      productName: product.name,
      type: txType,
      quantity,
      date: new Date().toISOString().split("T")[0],
      performedBy: user?.name || "Unknown",
      notes,
    };

    setTransactions(prev => [newTx, ...prev]);
    setProducts(prev => prev.map(p =>
      p.id === product.id
        ? { ...p, stock: txType === "stock-in" ? p.stock + quantity : p.stock - quantity }
        : p
    ));
    toast({ title: `${txType === "stock-in" ? "Stock In" : "Stock Out"} recorded` });
    setDialogOpen(false);
    setSelectedProduct("");
    setQty("");
    setNotes("");
  };

  const filteredTx = filter === "all" ? transactions : transactions.filter(t => t.type === filter);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2">
          {(["all", "stock-in", "stock-out"] as const).map(f => (
            <Button key={f} variant={filter === f ? "default" : "secondary"} size="sm" onClick={() => setFilter(f)}>
              {f === "all" ? "All" : f === "stock-in" ? "Stock In" : "Stock Out"}
            </Button>
          ))}
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />New Transaction</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Transaction</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleTransaction} className="space-y-4">
              <div className="flex gap-2">
                <Button type="button" variant={txType === "stock-in" ? "default" : "secondary"} className="flex-1" onClick={() => setTxType("stock-in")}>
                  <ArrowDownCircle className="h-4 w-4 mr-2" />Stock In
                </Button>
                <Button type="button" variant={txType === "stock-out" ? "default" : "secondary"} className="flex-1" onClick={() => setTxType("stock-out")}>
                  <ArrowUpCircle className="h-4 w-4 mr-2" />Stock Out
                </Button>
              </div>
              <div>
                <Label>Product</Label>
                <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                  <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                  <SelectContent>
                    {products.map(p => (
                      <SelectItem key={p.id} value={p.id}>{p.name} ({p.stock} {p.unit})</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Quantity</Label><Input type="number" value={qty} onChange={e => setQty(e.target.value)} required min={1} /></div>
              <div><Label>Notes</Label><Input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional notes" /></div>
              <Button type="submit" className="w-full">Record Transaction</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0 overflow-auto">
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
              {filteredTx.map(t => (
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
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryPage;
