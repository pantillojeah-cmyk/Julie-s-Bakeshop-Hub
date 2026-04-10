import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

const LoginPage = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!username.trim() || !password.trim()) {
      setError("Please fill in all fields.");
      return;
    }
    const result = await login(username.trim(), password);
    if (!result.ok) {
      setError(result.error || "Invalid username or password.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm shadow-lg border-primary/10">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 w-24 h-24 rounded-full overflow-hidden border-2 border-accent shadow-md">
            <img src="/logo.png" alt="Julie's Bakeshop Logo" className="w-full h-full object-cover" />
          </div>
          <h1 className="text-2xl font-bold text-foreground tracking-tight">Julie's Bakeshop</h1>
          <p className="text-sm text-muted-foreground mt-1">Pitogo Branch — Inventory System</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-5 pt-2">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input 
                id="username" 
                name="username"
                autoComplete="username"
                value={username} 
                onChange={e => setUsername(e.target.value)} 
                placeholder="Enter username" 
                className="bg-muted/50 focus-visible:ring-accent"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input 
                  id="password" 
                  name="password"
                  autoComplete="current-password"
                  type={showPassword ? "text" : "password"} 
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  placeholder="Enter password" 
                  className="bg-muted/50 pr-10 focus-visible:ring-accent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            {error && <p className="text-sm text-destructive bg-destructive/10 p-2 rounded text-center">{error}</p>}
            <Button type="submit" className="w-full shadow-md font-semibold">Sign In</Button>
            <p className="text-[10px] text-center text-muted-foreground uppercase tracking-widest mt-6">Secure Access — Admin/Staff only</p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginPage;
