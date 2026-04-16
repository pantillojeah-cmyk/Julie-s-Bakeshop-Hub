import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getRawMaterials, createRawMaterial, updateRawMaterial, deleteRawMaterial, RawMaterial } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { Plus, Search, Edit, Trash2, Loader2, Utensils } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

const RawMaterialsPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<RawMaterial | null>(null);
  const { toast } = useToast();

  const { data: rawMaterials = [], isLoading } = useQuery({
    queryKey: ["raw_materials"],
    queryFn: getRawMaterials,
  });

  const createMutation = useMutation({
    mutationFn: createRawMaterial,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["raw_materials"] });
      toast({ title: "Ingredient added" });
      setDialogOpen(false);
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => updateRawMaterial(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["raw_materials"] });
      toast({ title: "Ingredient updated" });
      setEditing(null);
      setDialogOpen(false);
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteRawMaterial,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["raw_materials"] });
      toast({ title: "Ingredient deleted", variant: "destructive" });
    },
    onError: (err: Error) => toast({ title: "Error", description: err.message, variant: "destructive" }),
  });

  const filtered = rawMaterials.filter(rm =>
    rm.name.toLowerCase().includes(search.toLowerCase()) ||
    rm.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data = {
      name: fd.get("name") as string,
      category: fd.get("category") as string,
      unit: fd.get("unit") as string,
      stock: editing ? editing.stock : Number(fd.get("stock") || 0),
      min_stock: Number(fd.get("min_stock")),
      expiry_date: fd.get("expiry_date") as string,
    };

    if (editing) {
      updateMutation.mutate({ id: editing.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const getStockStatus = (rm: RawMaterial) => {
    if (rm.stock <= rm.min_stock) return <Badge variant="destructive">Low</Badge>;
    return <Badge variant="default">OK</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search ingredients..." className="pl-9" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <Dialog open={dialogOpen} onOpenChange={o => { setDialogOpen(o); if (!o) setEditing(null); }}>
          <DialogTrigger asChild>
            <Button><Plus className="h-4 w-4 mr-2" />Add Ingredient</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing ? "Edit Ingredient" : "Add Ingredient"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSave} className="grid grid-cols-2 gap-3">
              <div className="col-span-2"><Label>Name</Label><Input name="name" defaultValue={editing?.name} required /></div>
              <div><Label>Category</Label><Input name="category" defaultValue={editing?.category} required placeholder="e.g., Flour, Sugar" /></div>
              <div><Label>Unit</Label><Input name="unit" defaultValue={editing?.unit} required placeholder="e.g., kg, sacks" /></div>
              <div><Label>Min Stock Level</Label><Input name="min_stock" type="number" defaultValue={editing?.min_stock} required /></div>
              {!editing && <div><Label>Initial Stock</Label><Input name="stock" type="number" defaultValue={0} /></div>}
              <div className={editing ? "col-span-2" : ""}><Label>Expiry Date</Label><Input name="expiry_date" type="date" defaultValue={editing?.expiry_date ? new Date(editing.expiry_date).toISOString().split('T')[0] : ''} required /></div>
              <div className="col-span-2">
                <Button type="submit" className="w-full" disabled={createMutation.isPending || updateMutation.isPending}>
                  {(createMutation.isPending || updateMutation.isPending) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {editing ? "Update" : "Add"} Ingredient
                </Button>
              </div>
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
                <TableHead className="text-right">Stock Level</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Expiry</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map(rm => (
                <TableRow key={rm.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Utensils className="h-4 w-4 text-muted-foreground" />
                      {rm.name}
                    </div>
                  </TableCell>
                  <TableCell>{rm.category}</TableCell>
                  <TableCell className="text-right">{rm.stock} {rm.unit}</TableCell>
                  <TableCell>{getStockStatus(rm)}</TableCell>
                  <TableCell>{new Date(rm.expiry_date).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right space-x-1">
                    <Button size="icon" variant="ghost" onClick={() => { setEditing(rm); setDialogOpen(true); }}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    {isAdmin && (
                      <Button size="icon" variant="ghost" onClick={() => {
                        if (confirm("Are you sure you want to delete this ingredient?")) deleteMutation.mutate(rm.id);
                      }} disabled={deleteMutation.isPending}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No ingredients found.</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default RawMaterialsPage;
