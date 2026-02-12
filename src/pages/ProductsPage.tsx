import { useState } from "react";
import { mockProducts } from "@/data/mockData";
import { Product } from "@/types/inventory";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Search, Edit, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

const ProductsPage = () => {
  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const { toast } = useToast();

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data: Product = {
      id: editing?.id || Date.now().toString(),
      name: fd.get("name") as string,
      category: fd.get("category") as string,
      unit: fd.get("unit") as string,
      price: Number(fd.get("price")),
      stock: editing?.stock ?? Number(fd.get("stock") || 0),
      minStock: Number(fd.get("minStock")),
      expiryDate: fd.get("expiryDate") as string,
      supplierId: fd.get("supplierId") as string,
    };
    if (editing) {
      setProducts(prev => prev.map(p => p.id === editing.id ? { ...data, stock: p.stock } : p));
      toast({ title: "Product updated" });
    } else {
      setProducts(prev => [...prev, data]);
      toast({ title: "Product added" });
    }
    setEditing(null);
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    toast({ title: "Product deleted", variant: "destructive" });
  };

  const getStockStatus = (p: Product) => {
    if (p.stock <= p.minStock) return <Badge variant="destructive">Low</Badge>;
    return <Badge variant="default">OK</Badge>;
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search products..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Dialog open={dialogOpen} onOpenChange={o => { setDialogOpen(o); if (!o) setEditing(null); }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Add Product</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Product" : "Add Product"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><Label>Name</Label><Input name="name" defaultValue={editing?.name} required /></div>
              <div><Label>Category</Label><Input name="category" defaultValue={editing?.category} required /></div>
              <div><Label>Unit</Label><Input name="unit" defaultValue={editing?.unit} required /></div>
              <div><Label>Price (₱)</Label><Input name="price" type="number" step="0.01" defaultValue={editing?.price} required /></div>
              <div><Label>Min Stock</Label><Input name="minStock" type="number" defaultValue={editing?.minStock} required /></div>
              {!editing && <div><Label>Initial Stock</Label><Input name="stock" type="number" defaultValue={0} /></div>}
              <div><Label>Expiry Date</Label><Input name="expiryDate" type="date" defaultValue={editing?.expiryDate} required /></div>
              <div className="col-span-2"><Label>Supplier ID</Label><Input name="supplierId" defaultValue={editing?.supplierId} /></div>
              <div className="col-span-2"><Button type="submit" className="w-full">{editing ? "Update" : "Add"} Product</Button></div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead className="text-right">Price</TableHead>
                <TableHead className="text-right">Stock</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(p => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.name}</TableCell>
                  <TableCell>{p.category}</TableCell>
                  <TableCell className="text-right">₱{p.price.toFixed(2)}</TableCell>
                  <TableCell className="text-right">{p.stock} {p.unit}</TableCell>
                  <TableCell>{getStockStatus(p)}</TableCell>
                  <TableCell>{p.expiryDate}</TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button size="icon" variant="ghost" onClick={() => { setEditing(p); setDialogOpen(true); }}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => handleDelete(p.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductsPage;
