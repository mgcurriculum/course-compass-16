import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { GraduationCap, Loader2, Globe, BookOpen, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function Login() {
  const { user, loading: authLoading } = useAuth();
  const { signIn } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await signIn(email, password);
    if (error) {
      toast({ title: 'Login failed', description: error.message, variant: 'destructive' });
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen">
      {/* Left panel - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary via-primary/90 to-primary/70 items-center justify-center p-12">
        <div className="max-w-md text-primary-foreground space-y-8">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-foreground/20 backdrop-blur">
              <GraduationCap className="h-7 w-7" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">SACDMS</h1>
          </div>
          <h2 className="text-3xl font-bold tracking-tight leading-tight">
            Study Abroad Course Discovery & Management
          </h2>
          <p className="text-primary-foreground/80 text-lg">
            Intelligent course matching, centralized management, and seamless student tracking.
          </p>
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-primary-foreground/70" />
              <span className="text-sm text-primary-foreground/80">350+ Universities Worldwide</span>
            </div>
            <div className="flex items-center gap-3">
              <BookOpen className="h-5 w-5 text-primary-foreground/70" />
              <span className="text-sm text-primary-foreground/80">5,000+ Courses & Growing</span>
            </div>
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-primary-foreground/70" />
              <span className="text-sm text-primary-foreground/80">Built for Counselors & Admins</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel - login */}
      <div className="flex flex-1 items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md rounded-xl shadow-lg border-0 bg-card">
          <CardHeader className="text-center space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-md">
              <GraduationCap className="h-8 w-8 text-primary-foreground" />
            </div>
            <CardTitle className="text-2xl tracking-tight">Welcome back</CardTitle>
            <CardDescription>Sign in to access the platform</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="rounded-lg"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="rounded-lg"
                  required
                />
              </div>
              <Button type="submit" className="w-full rounded-lg bg-gradient-to-r from-primary to-primary/90 shadow-sm transition-all hover:shadow-md" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Sign In
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
