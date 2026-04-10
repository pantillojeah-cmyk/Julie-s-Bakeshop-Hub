import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getProducts, getTransactions, createTransaction, Product, Transaction } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { ArrowDownCircle, ArrowUpCircle, Plus, Loader2 } from "lucide-react";

const InventoryPage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [dialogOpen, setDialogOpen] = useState(false);
  const [txType, setTxType] = useState<"stock-in" | "stock-out">("stock-in");
  const [selectedProduct, setSelectedProduct] = useState("");
  const [qty, setQty] = useState("");
  const [notes, setNotes] = useState("");
  const [filter, setFilter] = useState<"all" | "stock-in" | "stock-out">("all");

  const { data: products = [], isLoading: productsLoading } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts,
  });

  const { data: transactions = [], isLoading: txLoading } = useQuery({
    queryKey: ["transactions"],
    queryFn: getTransactions,
  });

  const txMutation = useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      toast({ title: `${txType === "stock-in" ? "Stock In" : "Stock Out"} recorded` });
      setDialogOpen(false);
      setSelectedProduct("");
      setQty("");
      setNotes("");
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const handleTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;
    const quantity = Number(qty);
    if (quantity <= 0) { toast({ title: "Invalid quantity", variant: "destructive" }); return; }
    
    /*
    if (txType === "stock-out" && quantity > product.stock) {
      toast({ title: "Insufficient stock", variant: "destructive" });
      return;
    }
    */

    txMutation.mutate({
      product_id: product.id,
      type: txType,
      quantity,
      performed_by: user?.id || "",
      notes,
    });
  };

  const filteredTx = filter === "all" ? transactions : transactions.filter(t => t.type === filter);

  if (productsLoading || txLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

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
              <Button type="submit" className="w-full" disabled={txMutation.isPending}>
                {txMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Record Transaction
              </Button>
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
                  <TableCell>{new Date(t.created_at).toLocaleString()}</TableCell>
                  <TableCell className="font-medium">{t.product_name}</TableCell>
                  <TableCell>
                    <Badge variant={t.type === "stock-in" ? "default" : "secondary"}>
                      {t.type === "stock-in" ? "IN" : "OUT"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">{t.quantity}</TableCell>
                  <TableCell>{t.performed_by_name || t.performed_by}</TableCell>
                  <TableCell className="text-muted-foreground text-sm">{t.notes}</TableCell>
                </TableRow>
              ))}
              {filteredTx.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No transactions found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default InventoryPage;
