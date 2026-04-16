import { useQuery } from "@tanstack/react-query";
import { getStats, getProducts, getRawMaterials, getTransactions } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, AlertTriangle, Clock, ArrowLeftRight, Loader2, Wheat } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const DashboardPage = () => {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["stats"],
    queryFn: getStats,
  });

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

  if (statsLoading || productsLoading || rawLoading || txLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const expiredProducts = products.filter(p => new Date(p.expiry_date) < new Date());
  const expiredIngredients = rawMaterials.filter(rm => new Date(rm.expiry_date) < new Date());
  
  const expiringSoonProducts = products.filter(p => {
    const d = new Date(p.expiry_date);
    const now = new Date();
    const next7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return d >= now && d <= next7Days;
  });

  const expiringSoonIngredients = rawMaterials.filter(rm => {
    const d = new Date(rm.expiry_date);
    const now = new Date();
    const next7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return d >= now && d <= next7Days;
  });

  const lowStockItems = [
    ...products.filter(p => p.stock <= p.min_stock).map(p => ({ ...p, type: 'Product' })),
    ...rawMaterials.filter(rm => rm.stock <= rm.min_stock).map(rm => ({ ...rm, type: 'Ingredient' }))
  ];

  const recentTransactions = transactions.slice(0, 5);

  const statCards = [
    { label: "Total Products", value: stats?.totalProducts || 0, icon: Package, color: "text-primary" },
    { label: "Total Ingredients", value: stats?.totalIngredients || 0, icon: Wheat, color: "text-amber-600" },
    { label: "Low Stock Items", value: stats?.lowStockItems || 0, icon: AlertTriangle, color: "text-destructive" },
    { label: "Expired Items", value: stats?.expiredItems || 0, icon: AlertTriangle, color: "text-red-500" },
    { label: "Expiring Soon", value: stats?.expiringSoon || 0, icon: Clock, color: "text-amber-500" },
    { label: "Today's Actions", value: stats?.todayTransactions || 0, icon: ArrowLeftRight, color: "text-green-500" },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map(s => (
          <Card key={s.label} className="card-hover">
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`p-3 rounded-lg bg-muted ${s.color}`}>
                <s.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[400px] overflow-auto">
            {lowStockItems.length === 0 ? (
              <p className="text-sm text-muted-foreground">All stocks sufficient.</p>
            ) : (
              lowStockItems.map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium text-sm text-foreground">{item.name}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{item.category} ({item.type})</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="destructive">{item.stock} {item.unit}</Badge>
                    <p className="text-[10px] text-muted-foreground mt-1 text-xs">Min: {item.min_stock}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-1 border-amber-100 dark:border-amber-900/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base text-amber-600 dark:text-amber-500">
              <Clock className="h-5 w-5" />
              Expiry Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[400px] overflow-auto">
            {[...expiredProducts, ...expiredIngredients, ...expiringSoonProducts, ...expiringSoonIngredients].length === 0 ? (
              <p className="text-sm text-muted-foreground">No recent expiry issues.</p>
            ) : (
              [...expiredProducts, ...expiredIngredients, ...expiringSoonProducts, ...expiringSoonIngredients].map((item: any) => {
                const isExpired = new Date(item.expiry_date) < new Date();
                return (
                  <div key={item.id} className={`flex items-center justify-between p-3 rounded-lg ${isExpired ? 'bg-red-50 dark:bg-red-950/20 border border-red-100 dark:border-red-900/30' : 'bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100/50 dark:border-amber-900/30'}`}>
                    <div>
                      <p className={`font-medium text-sm ${isExpired ? 'text-red-700 dark:text-red-400' : 'text-amber-700 dark:text-amber-400'}`}>{item.name}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{new Date(item.expiry_date).toLocaleDateString()} — {products.find(p => p.id === item.id) ? 'Product' : 'Ingredient'}</p>
                    </div>
                    <Badge variant={isExpired ? "destructive" : "outline"} className={isExpired ? "" : "border-amber-200 text-amber-700 dark:text-amber-400"}>
                      {isExpired ? "EXPIRED" : "SOON"}
                    </Badge>
                  </div>
                );
              })
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ArrowLeftRight className="h-5 w-5 text-success" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[400px] overflow-auto">
            {recentTransactions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No recent activity.</p>
            ) : (
              recentTransactions.map(t => (
                <div key={t.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="min-w-0 pr-2">
                    <p className="font-medium text-sm text-foreground truncate">{t.product_name || t.raw_material_name}</p>
                    <p className="text-[10px] text-muted-foreground line-clamp-1">{new Date(t.created_at).toLocaleDateString()} — {t.performed_by_name || t.performed_by}</p>
                  </div>
                  <Badge variant={t.type === "stock-in" ? "default" : "secondary"} className="shrink-0">
                    {t.type === "stock-in" ? "+" : "-"}{t.quantity} {t.type === "stock-in" ? "IN" : "OUT"}
                  </Badge>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
