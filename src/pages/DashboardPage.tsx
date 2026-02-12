import { getDashboardStats, mockProducts, mockTransactions } from "@/data/mockData";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, AlertTriangle, Clock, ArrowLeftRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const stats = getDashboardStats();
const lowStockProducts = mockProducts.filter(p => p.stock <= p.minStock);
const recentTransactions = mockTransactions.slice(0, 5);

const statCards = [
  { label: "Total Products", value: stats.totalProducts, icon: Package, color: "text-primary" },
  { label: "Low Stock Items", value: stats.lowStockItems, icon: AlertTriangle, color: "text-destructive" },
  { label: "Expiring Soon", value: stats.expiringItems, icon: Clock, color: "text-warning" },
  { label: "Today's Transactions", value: stats.todayTransactions, icon: ArrowLeftRight, color: "text-success" },
];

const DashboardPage = () => {
  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(s => (
          <Card key={s.label} className="card-hover">
            <CardContent className="flex items-center gap-4 p-5">
              <div className={`p-3 rounded-lg bg-muted ${s.color}`}>
                <s.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">{s.value}</p>
                <p className="text-sm text-muted-foreground">{s.label}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Low Stock Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {lowStockProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground">All stocks are sufficient.</p>
            ) : (
              lowStockProducts.map(p => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium text-sm text-foreground">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.category}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant="destructive">{p.stock} {p.unit}</Badge>
                    <p className="text-xs text-muted-foreground mt-1">Min: {p.minStock}</p>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentTransactions.map(t => (
              <div key={t.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium text-sm text-foreground">{t.productName}</p>
                  <p className="text-xs text-muted-foreground">{t.date} — {t.performedBy}</p>
                </div>
                <Badge variant={t.type === "stock-in" ? "default" : "secondary"}>
                  {t.type === "stock-in" ? "+" : "-"}{t.quantity} {t.type === "stock-in" ? "IN" : "OUT"}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
