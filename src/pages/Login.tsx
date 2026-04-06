import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Globe, Loader2, BookOpen, Users, MapPin } from 'lucide-react';
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
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[hsl(195,85%,30%)] via-[hsl(195,80%,35%)] to-[hsl(200,70%,40%)] items-center justify-center p-16">
        <div className="max-w-sm text-primary-foreground space-y-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary-foreground/15 backdrop-blur-sm">
              <Globe className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Edroots International</h1>
              <p className="text-xs text-primary-foreground/60 -mt-0.5">Study Abroad Platform</p>
            </div>
          </div>
          <h2 className="text-3xl font-bold tracking-tight leading-tight">
            Your Gateway to<br />Global Education
          </h2>
          <p className="text-primary-foreground/70 text-base leading-relaxed">
            Intelligent course matching, centralized management, and seamless student tracking — all in one place.
          </p>
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-3 text-primary-foreground/70">
              <MapPin className="h-4 w-4 shrink-0" />
              <span className="text-sm">350+ Universities Worldwide</span>
            </div>
            <div className="flex items-center gap-3 text-primary-foreground/70">
              <BookOpen className="h-4 w-4 shrink-0" />
              <span className="text-sm">5,000+ Courses & Growing</span>
            </div>
            <div className="flex items-center gap-3 text-primary-foreground/70">
              <Users className="h-4 w-4 shrink-0" />
              <span className="text-sm">Built for Counselors & Admins</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex flex-1 items-center justify-center bg-background px-6">
        <Card className="w-full max-w-sm border-0 shadow-xl bg-card">
          <CardHeader className="text-center space-y-3 pb-2">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 shadow-md">
              <Globe className="h-6 w-6 text-primary-foreground" />
            </div>
            <CardTitle className="text-xl tracking-tight">Welcome back</CardTitle>
            <CardDescription className="text-muted-foreground">Sign in to your account</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@company.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-medium">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full shadow-sm" disabled={loading}>
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
