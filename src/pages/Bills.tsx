import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Check, TestTube, Pill, Scissors, Stethoscope, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import healthdagLogo from "@/assets/healthdag-logo.png";
import Footer from "@/components/Footer";
import { SignaturePrompt } from "@/components/SignaturePrompt";
import { EncryptionNotice } from "@/components/EncryptionNotice";
import { useSignature } from "@/hooks/useSignature";

type Bill = {
  id: string;
  amount: number;
  description: string;
  status: string;
  created_at: string;
  hospital_id: string;
  category: string;
};

const categoryIcons = {
  lab: TestTube,
  pharmacy: Pill,
  surgery: Scissors,
  consultation: Stethoscope,
  other: Stethoscope,
};

const categoryGradients = {
  lab: "from-primary to-accent",
  pharmacy: "from-success to-accent",
  surgery: "from-destructive to-warning",
  consultation: "from-secondary to-primary",
  other: "from-muted-foreground to-muted",
};

const Bills = () => {
  const [bills, setBills] = useState<Bill[]>([]);
  const [filteredBills, setFilteredBills] = useState<Bill[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [accessGranted, setAccessGranted] = useState(false);
  const [showEncryptionNotice, setShowEncryptionNotice] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { requestSignature, isWaitingForSignature } = useSignature();

  useEffect(() => {
    requestAccessSignature();
  }, []);

  const requestAccessSignature = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    try {
      // Show encryption notice first
      setShowEncryptionNotice(true);
      
      // Wait longer to ensure user sees the notice
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Hide notice before showing signature prompt
      setShowEncryptionNotice(false);
      
      // Small delay between dialogs
      await new Promise(resolve => setTimeout(resolve, 300));

      // Request signature to access encrypted bills
      const message = `Accessing encrypted medical bills at ${new Date().toLocaleString()}`;
      const signature = await requestSignature(message);
      
      if (!signature) {
        toast({
          title: "Access Denied",
          description: "You must sign to access your encrypted medical bills",
          variant: "destructive",
        });
        navigate("/dashboard");
        return;
      }

      setAccessGranted(true);
      fetchBills();
    } catch (error) {
      setShowEncryptionNotice(false);
      console.error("Access signature error:", error);
    }
  };

  useEffect(() => {
    if (selectedCategory === "all") {
      setFilteredBills(bills);
    } else {
      setFilteredBills(bills.filter(bill => bill.category === selectedCategory));
    }
  }, [selectedCategory, bills]);

  const fetchBills = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data, error } = await (supabase as any)
      .from("medical_bills")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load bills",
        variant: "destructive",
      });
    } else {
      setBills(data || []);
    }
    setLoading(false);
  };

  const handlePayBill = async (billId: string, amount: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Get user's profile to check balance
    const { data: profile } = await (supabase as any)
      .from("profiles")
      .select("bdag_balance")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile || profile.bdag_balance < amount) {
      toast({
        title: "Insufficient Balance",
        description: "You don't have enough BDAG tokens to pay this bill",
        variant: "destructive",
      });
      return;
    }

    // Request signature for encryption
    const message = `Paying encrypted medical bill of ${amount} BDAG`;
    const signature = await requestSignature(message);
    
    if (!signature) {
      return;
    }

    // Update bill status
    const { error: billError } = await (supabase as any)
      .from("medical_bills")
      .update({
        status: "paid",
        paid_at: new Date().toISOString(),
        transaction_hash: `TX_${Math.random().toString(36).substring(2, 15)}`,
      })
      .eq("id", billId);

    // Update user balance
    const { error: balanceError } = await (supabase as any)
      .from("profiles")
      .update({
        bdag_balance: profile.bdag_balance - amount,
      })
      .eq("id", user.id);

    // Create transaction record
    const { error: txError } = await (supabase as any).from("wallet_transactions").insert({
      user_id: user.id,
      transaction_type: "payment",
      amount: amount,
      status: "completed",
    });

    if (billError || balanceError || txError) {
      toast({
        title: "Error",
        description: "Failed to process payment",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: "Bill paid successfully!",
      });
      fetchBills();
    }
  };

  const filterButtons = [
    { key: "all", label: "All Bills", icon: Sparkles },
    { key: "lab", label: "Lab", icon: TestTube },
    { key: "pharmacy", label: "Pharmacy", icon: Pill },
    { key: "surgery", label: "Surgery", icon: Scissors },
    { key: "consultation", label: "Consultation", icon: Stethoscope },
  ];

  return (
    <>
      <EncryptionNotice
        open={showEncryptionNotice}
        title="🔒 Encrypted Bill Payment"
        description="This feature is fully encrypted on the blockchain. Please sign with your wallet to securely access your medical bills."
      />

      <SignaturePrompt
        open={isWaitingForSignature}
        title={accessGranted ? "Encrypting Payment" : "Accessing Encrypted Bills"}
        description={accessGranted 
          ? "This payment transaction is being encrypted on the blockchain. Please sign in your wallet to confirm your identity and secure your payment data."
          : "Your medical bills are encrypted on the blockchain. Please sign in your wallet to confirm your identity and access your billing data."
        }
      />

      {(!accessGranted || loading) ? (
        <div className="min-h-screen flex items-center justify-center bg-gradient-mesh">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary/30 border-t-primary"></div>
            <div className="absolute inset-0 animate-ping rounded-full h-16 w-16 border-4 border-primary/20"></div>
          </div>
        </div>
      ) : (
        <div className="min-h-screen bg-gradient-mesh relative overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-10 w-96 h-96 bg-accent/5 rounded-full blur-3xl animate-float"></div>
        <div className="absolute bottom-40 left-10 w-80 h-80 bg-primary/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '1s' }}></div>
      </div>

      <header className="glass sticky top-0 z-50 border-b border-primary/10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")} className="hover:scale-105 transition-transform">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <img src={healthdagLogo} alt="HealthDAG" className="w-8 h-8 drop-shadow-lg" />
          <h1 className="text-xl font-bold gradient-text-primary">
            Medical Bills
          </h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 relative z-10">
        {/* Category Filter */}
        <div className="mb-8 flex flex-wrap gap-3 animate-fade-in">
          {filterButtons.map(({ key, label, icon: Icon }) => (
            <Button
              key={key}
              variant={selectedCategory === key ? "default" : "outline"}
              onClick={() => setSelectedCategory(key)}
              size="sm"
              className={`gap-2 transition-all duration-300 ${
                selectedCategory === key 
                  ? "shadow-button scale-105" 
                  : "hover:scale-105 hover:shadow-md"
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Button>
          ))}
        </div>

        {filteredBills.length === 0 ? (
          <Card className="max-w-md mx-auto text-center py-16 glass border-2 animate-bounce-in">
            <CardHeader>
              <div className="inline-flex p-4 bg-primary/10 rounded-full mb-4 mx-auto">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">No Bills Found</CardTitle>
              <CardDescription className="text-base mt-2">
                {selectedCategory === "all" 
                  ? "You don't have any medical bills at the moment"
                  : `No ${selectedCategory} bills found`}
              </CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredBills.map((bill, index) => {
              const Icon = categoryIcons[bill.category as keyof typeof categoryIcons] || Stethoscope;
              const gradient = categoryGradients[bill.category as keyof typeof categoryGradients];
              return (
                <Card 
                  key={bill.id} 
                  className={`group card-hover-lift glass border-2 overflow-hidden relative animate-fade-in-up ${
                    bill.status === "paid" ? "opacity-70" : ""
                  }`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {/* Gradient overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
                  
                  <CardHeader className="relative z-10">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} bg-opacity-10 group-hover:scale-110 transition-transform`}>
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <Badge variant="outline" className="capitalize font-medium">
                          {bill.category}
                        </Badge>
                      </div>
                      {bill.status === "paid" && (
                        <Badge className="gap-1 bg-success text-success-foreground shadow-sm">
                          <Check className="w-3 h-3" />
                          Paid
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-3xl font-bold gradient-text-primary">
                      {bill.amount.toFixed(2)} BDAG
                    </CardTitle>
                    <CardDescription className="text-base font-medium">
                      {bill.description || "Medical Bill"}
                    </CardDescription>
                  </CardHeader>
                  
                  <CardContent className="relative z-10">
                    <div className="space-y-3 text-sm mb-5">
                      <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                        <span className="font-medium">Date:</span>
                        <span className="text-muted-foreground">{new Date(bill.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                        <span className="font-medium">Status:</span>
                        <Badge variant={bill.status === "paid" ? "default" : "secondary"} className="capitalize">
                          {bill.status}
                        </Badge>
                      </div>
                    </div>
                    {bill.status === "unpaid" && (
                      <Button
                        className="w-full shadow-button hover:shadow-button-hover transition-all duration-300"
                        onClick={() => handlePayBill(bill.id, bill.amount)}
                      >
                        Pay with BDAG
                      </Button>
                    )}
                  </CardContent>

                  {/* Bottom accent line */}
                  <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient} transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left`}></div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

        <Footer />
      </div>
      )}
    </>
  );
};

export default Bills;
