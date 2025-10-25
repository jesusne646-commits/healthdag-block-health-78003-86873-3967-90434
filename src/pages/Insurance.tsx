import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Shield, FileText, Plus, CheckCircle, Clock, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import healthdagLogo from "@/assets/healthdag-logo.png";
import Footer from "@/components/Footer";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/LanguageToggle";

type InsurancePolicy = {
  id: string;
  policy_number: string;
  provider: string;
  plan_type: string;
  coverage_amount: number;
  premium_amount: number;
  start_date: string;
  end_date: string;
  status: string;
  coverage_details: any;
};

type InsuranceClaim = {
  id: string;
  claim_number: string;
  claim_type: string;
  amount: number;
  status: string;
  description: string;
  submitted_at: string;
};

const Insurance = () => {
  const [policies, setPolicies] = useState<InsurancePolicy[]>([]);
  const [claims, setClaims] = useState<InsuranceClaim[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchInsuranceData();
  }, []);

  const fetchInsuranceData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data: policiesData, error: policiesError } = await (supabase as any)
      .from("insurance_policies")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (policiesError) {
      toast({
        title: "Error",
        description: "Failed to load insurance policies",
        variant: "destructive",
      });
    } else {
      setPolicies(policiesData || []);
    }

    const { data: claimsData, error: claimsError } = await (supabase as any)
      .from("insurance_claims")
      .select("*")
      .eq("user_id", user.id)
      .order("submitted_at", { ascending: false });

    if (claimsError) {
      toast({
        title: "Error",
        description: "Failed to load claims",
        variant: "destructive",
      });
    } else {
      setClaims(claimsData || []);
    }

    setLoading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'pending':
      case 'processing':
        return <Clock className="w-5 h-5 text-yellow-500" />;
      case 'expired':
      case 'rejected':
      case 'cancelled':
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/20">
      <header className="border-b border-primary/20 bg-background/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <img src={healthdagLogo} alt="HealthDAG" className="w-12 h-12 drop-shadow-[0_0_20px_rgba(34,211,238,0.4)]" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              BlockDAG Health Insurance
            </h1>
          </div>
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Policies Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-primary" />
              <h2 className="text-2xl font-bold">My Insurance Policies</h2>
            </div>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              New Policy
            </Button>
          </div>

          {policies.length === 0 ? (
            <Card className="p-8 text-center">
              <Shield className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Insurance Policies</h3>
              <p className="text-muted-foreground mb-4">
                Get started with BlockDAG Health Insurance for comprehensive coverage
              </p>
              <Button>Get Insurance</Button>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {policies.map((policy) => (
                <Card key={policy.id} className="overflow-hidden">
                  <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          {policy.provider}
                          {getStatusIcon(policy.status)}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          Policy #{policy.policy_number}
                        </CardDescription>
                      </div>
                      <span className="px-3 py-1 bg-primary/20 text-primary rounded-full text-sm font-semibold">
                        {policy.plan_type}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Coverage</p>
                        <p className="text-lg font-semibold">
                          ${policy.coverage_amount.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Premium</p>
                        <p className="text-lg font-semibold">
                          ${policy.premium_amount}/mo
                        </p>
                      </div>
                    </div>
                    <div className="space-y-2 text-sm">
                      <p>
                        <span className="text-muted-foreground">Valid:</span>{" "}
                        {new Date(policy.start_date).toLocaleDateString()} -{" "}
                        {new Date(policy.end_date).toLocaleDateString()}
                      </p>
                      {policy.coverage_details && (
                        <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                          <p className="font-semibold mb-2">Coverage Details:</p>
                          <ul className="space-y-1 text-xs">
                            {Object.entries(policy.coverage_details).map(([key, value]) => (
                              <li key={key} className="flex justify-between">
                                <span className="capitalize">{key}:</span>
                                <span className="font-semibold">{value as string}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Claims Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-primary" />
              <h2 className="text-2xl font-bold">Insurance Claims</h2>
            </div>
            <Button variant="outline" className="gap-2">
              <Plus className="w-4 h-4" />
              File Claim
            </Button>
          </div>

          {claims.length === 0 ? (
            <Card className="p-8 text-center">
              <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No Claims Filed</h3>
              <p className="text-muted-foreground">
                File a claim when you need to get reimbursed for medical expenses
              </p>
            </Card>
          ) : (
            <div className="space-y-4">
              {claims.map((claim) => (
                <Card key={claim.id}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base flex items-center gap-2">
                          Claim #{claim.claim_number}
                          {getStatusIcon(claim.status)}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {claim.claim_type} • ${claim.amount.toFixed(2)}
                        </CardDescription>
                      </div>
                      <span className="px-3 py-1 bg-secondary text-secondary-foreground rounded-full text-xs font-semibold capitalize">
                        {claim.status}
                      </span>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2">{claim.description}</p>
                    <p className="text-xs text-muted-foreground">
                      Submitted: {new Date(claim.submitted_at).toLocaleDateString()}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Insurance;
