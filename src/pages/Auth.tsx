import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import healthdagLogo from "@/assets/healthdag-logo.png";
import { User } from "@supabase/supabase-js";
import { WalletConnectionPrompt } from "@/components/WalletConnectionPrompt";
import { useMetaMask } from "@/hooks/useMetaMask";

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [showWalletPrompt, setShowWalletPrompt] = useState(false);
  const walletPromptShown = useRef(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { connectWallet, isConnected } = useMetaMask();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user && !showWalletPrompt) {
        navigate("/dashboard");
      }
    });
  }, [navigate, showWalletPrompt]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      // Don't navigate automatically, let the wallet prompt handle it
      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });

    setLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Account created! Please connect your wallet.",
      });
      // Show wallet prompt after a brief delay to ensure auth state is updated
      setTimeout(() => {
        walletPromptShown.current = true;
        setShowWalletPrompt(true);
      }, 500);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Signed in successfully!",
      });
      // Show wallet prompt for returning users if not connected
      if (!isConnected && !walletPromptShown.current) {
        setTimeout(() => {
          walletPromptShown.current = true;
          setShowWalletPrompt(true);
        }, 500);
      } else {
        navigate("/dashboard");
      }
    }
  };

  const handleConnectWallet = async () => {
    await connectWallet();
    setShowWalletPrompt(false);
    // Navigate to dashboard after wallet connection
    navigate("/dashboard");
  };

  const handleSkipWallet = () => {
    setShowWalletPrompt(false);
    // Navigate to dashboard even if skipped
    navigate("/dashboard");
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-b from-background via-background to-secondary/20">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-secondary/20" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000" />

      <Card className="w-full max-w-md relative z-10 border-primary/20">
        <CardHeader className="text-center">
          <img 
            src={healthdagLogo} 
            alt="HealthDAG Logo" 
            className="w-20 h-20 mx-auto mb-4 drop-shadow-[0_0_20px_rgba(34,211,238,0.4)]"
          />
          <CardTitle className="text-2xl bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Welcome to HealthDAG
          </CardTitle>
          <CardDescription>
            Secure, decentralized healthcare management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signin-email">Email</Label>
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signin-password">Password</Label>
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name</Label>
                  <Input
                    id="signup-name"
                    type="text"
                    placeholder="John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creating account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="link" onClick={() => navigate("/")}>
            Back to Home
          </Button>
        </CardFooter>
      </Card>

      <WalletConnectionPrompt
        open={showWalletPrompt}
        onConnect={handleConnectWallet}
        onSkip={handleSkipWallet}
      />
    </div>
  );
};

export default Auth;
