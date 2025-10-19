import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, FileText, AlertCircle, Wallet, CreditCard, LogOut, Shield, Sparkles } from "lucide-react";
import healthdagLogo from "@/assets/healthdag-logo.png";
import AIAssistant from "@/components/AIAssistant";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  const generateDemoDataIfNeeded = async () => {
    try {
      const { data: records } = await (supabase as any)
        .from("medical_records")
        .select("id")
        .limit(1);
      
      if (!records || records.length === 0) {
        await supabase.functions.invoke('demo-data');
      }
    } catch (error) {
      console.error('Error generating demo data:', error);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        setUser(session.user);
        await generateDemoDataIfNeeded();
      } else {
        navigate("/auth");
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser(session.user);
      } else {
        navigate("/auth");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-mesh">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/30 border-t-primary"></div>
          <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-4 border-primary/20"></div>
        </div>
      </div>
    );
  }

  const actionCards = [
    {
      title: "Book Appointment",
      description: "Search and book with hospitals",
      icon: Calendar,
      path: "/appointments",
      gradient: "from-primary via-primary-light to-accent",
      iconBg: "bg-gradient-to-br from-primary/10 to-accent/10",
      iconColor: "text-primary",
    },
    {
      title: "Pay Medical Bill",
      description: "Pay with BDAG tokens",
      icon: CreditCard,
      path: "/bills",
      gradient: "from-accent via-accent-light to-secondary",
      iconBg: "bg-gradient-to-br from-accent/10 to-secondary/10",
      iconColor: "text-accent",
    },
    {
      title: "Medical Records",
      description: "View encrypted health data",
      icon: FileText,
      path: "/records",
      gradient: "from-secondary via-secondary-light to-primary",
      iconBg: "bg-gradient-to-br from-secondary/10 to-primary/10",
      iconColor: "text-secondary",
    },
    {
      title: "Emergency Access",
      description: "QR code & critical info",
      icon: AlertCircle,
      path: "/emergency",
      gradient: "from-destructive via-warning to-warning",
      iconBg: "bg-gradient-to-br from-destructive/10 to-warning/10",
      iconColor: "text-destructive",
    },
    {
      title: "My Wallet",
      description: "BDAG balance, send/receive tokens",
      icon: Wallet,
      path: "/wallet",
      gradient: "from-success via-accent to-primary",
      iconBg: "bg-gradient-to-br from-success/10 to-accent/10",
      iconColor: "text-success",
    },
    {
      title: "Health Insurance",
      description: "BlockDAG coverage & claims",
      icon: Shield,
      path: "/insurance",
      gradient: "from-primary via-secondary to-accent",
      iconBg: "bg-gradient-to-br from-primary/10 to-secondary/10",
      iconColor: "text-primary",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-mesh relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary/5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-secondary/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }}></div>
      </div>

      {/* Header with glass effect */}
      <header className="glass sticky top-0 z-50 border-b border-primary/10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3 animate-fade-in">
            <img src={healthdagLogo} alt="HealthDAG" className="w-10 h-10 drop-shadow-lg" />
            <h1 className="text-xl font-bold gradient-text-primary">
              HealthDAG
            </h1>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSignOut}
            className="hover:shadow-button transition-all duration-300 hover:scale-105"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12 relative z-10">
        <div className="mb-12 text-center animate-fade-in-up">
          <div className="inline-flex items-center gap-2 mb-4 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
            <Sparkles className="w-4 h-4 text-primary animate-pulse" />
            <span className="text-sm font-medium text-primary">Welcome to HealthDAG 2.0</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-bold mb-4 gradient-text">
            Welcome back!
          </h2>
          <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
            Manage your healthcare from one secure, beautiful dashboard
          </p>
        </div>

        {/* Action Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {actionCards.map((card, index) => {
            const Icon = card.icon;
            return (
              <Card
                key={card.path}
                className="group cursor-pointer card-hover-lift bg-card/80 backdrop-blur-sm border-2 border-border hover:border-primary/30 overflow-hidden relative animate-fade-in-up shadow-card"
                style={{ animationDelay: `${index * 0.1}s` }}
                onClick={() => navigate(card.path)}
              >
                {/* Gradient overlay on hover */}
                <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                
                <CardHeader className="relative z-10">
                  <div className="flex items-center gap-4">
                    <div className={`p-4 ${card.iconBg} rounded-2xl group-hover:scale-110 transition-transform duration-300`}>
                      <Icon className={`w-7 h-7 ${card.iconColor}`} />
                    </div>
                    <div>
                      <CardTitle className="text-xl mb-1 group-hover:gradient-text-primary transition-all">
                        {card.title}
                      </CardTitle>
                      <CardDescription className="text-sm">
                        {card.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                
                {/* Bottom accent line */}
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${card.gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`}></div>
              </Card>
            );
          })}
        </div>

        {/* Feature highlights */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in-up" style={{ animationDelay: '0.6s' }}>
          <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/10">
            <div className="inline-flex p-3 bg-primary/10 rounded-full mb-4">
              <Shield className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Secure & Encrypted</h3>
            <p className="text-sm text-muted-foreground">Your data is protected with blockchain technology</p>
          </div>
          <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-accent/5 to-secondary/5 border border-accent/10">
            <div className="inline-flex p-3 bg-accent/10 rounded-full mb-4">
              <Sparkles className="w-6 h-6 text-accent" />
            </div>
            <h3 className="font-semibold mb-2">AI-Powered Insights</h3>
            <p className="text-sm text-muted-foreground">Get intelligent health recommendations</p>
          </div>
          <div className="text-center p-6 rounded-2xl bg-gradient-to-br from-secondary/5 to-primary/5 border border-secondary/10">
            <div className="inline-flex p-3 bg-secondary/10 rounded-full mb-4">
              <Wallet className="w-6 h-6 text-secondary" />
            </div>
            <h3 className="font-semibold mb-2">BDAG Payments</h3>
            <p className="text-sm text-muted-foreground">Fast, secure cryptocurrency transactions</p>
          </div>
        </div>
      </div>

      <Footer />
      <AIAssistant />
    </div>
  );
};

export default Dashboard;
