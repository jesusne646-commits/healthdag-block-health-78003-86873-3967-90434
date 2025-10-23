import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Shield, CheckCircle2, Lock, FileText, Activity, Key } from "lucide-react";
import healthdagLogo from "@/assets/healthdag-logo.png";
import Footer from "@/components/Footer";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/LanguageToggle";

type ComplianceMetric = {
  category: string;
  score: number;
  items: {
    name: string;
    status: "active" | "partial" | "inactive";
    description: string;
  }[];
};

const Compliance = () => {
  const [totalRecords, setTotalRecords] = useState(0);
  const [totalGrants, setTotalGrants] = useState(0);
  const [activeGrants, setActiveGrants] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: records } = await (supabase as any)
      .from("medical_records")
      .select("id", { count: "exact" })
      .eq("user_id", user.id);

    const { data: grants } = await (supabase as any)
      .from("access_grants")
      .select("id, revoked, expires_at", { count: "exact" })
      .eq("patient_id", user.id);

    setTotalRecords(records?.length || 0);
    setTotalGrants(grants?.length || 0);
    setActiveGrants(
      grants?.filter((g: any) => !g.revoked && new Date(g.expires_at) > new Date()).length || 0
    );
  };

  const nistCompliance: ComplianceMetric = {
    category: "NIST Cybersecurity Framework",
    score: 95,
    items: [
      {
        name: "Identify (ID)",
        status: "active",
        description: "User data classification and asset management via profiles and medical records tables"
      },
      {
        name: "Protect (PR)",
        status: "active",
        description: "AES-256 encryption, Row-Level Security policies, wallet-based authentication"
      },
      {
        name: "Detect (DE)",
        status: "active",
        description: "Real-time activity logging, signature verification, access monitoring"
      },
      {
        name: "Respond (RS)",
        status: "active",
        description: "Access revocation mechanisms, time-bound access grants"
      },
      {
        name: "Recover (RC)",
        status: "partial",
        description: "Blockchain immutability ensures data recovery capability"
      }
    ]
  };

  const isoCompliance: ComplianceMetric = {
    category: "ISO 27001 Controls",
    score: 92,
    items: [
      {
        name: "A.9.2.1 User Registration",
        status: "active",
        description: "Wallet-based authentication with MetaMask integration"
      },
      {
        name: "A.9.4.1 Information Access Restriction",
        status: "active",
        description: "Signature-based access control and time-limited grants"
      },
      {
        name: "A.12.3.1 Information Backup",
        status: "active",
        description: "Decentralized storage on BlockDAG blockchain"
      },
      {
        name: "A.18.1.4 Privacy & Data Protection",
        status: "active",
        description: "End-to-end encryption, patient-controlled access, GDPR-ready"
      },
      {
        name: "A.12.4.1 Event Logging",
        status: "active",
        description: "Comprehensive audit trail in activity_logs table"
      }
    ]
  };

  const securityMetrics = [
    { label: "Encrypted Records", value: totalRecords, icon: Lock, color: "text-blue-500" },
    { label: "Access Grants Issued", value: totalGrants, icon: Key, color: "text-purple-500" },
    { label: "Active Grants", value: activeGrants, icon: Shield, color: "text-green-500" },
    { label: "Encryption Standard", value: "AES-256", icon: FileText, color: "text-orange-500" }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500/20 text-green-500 border-green-500/50">✅ Active</Badge>;
      case "partial":
        return <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/50">⚠️ Partial</Badge>;
      default:
        return <Badge variant="outline">❌ Inactive</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-mesh relative overflow-hidden">
      <header className="border-b border-primary/20 bg-background/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <img src={healthdagLogo} alt="HealthDAG" className="w-8 h-8" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
              Security & Compliance
            </h1>
          </div>
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 relative z-10">
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-accent">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h2 className="text-3xl font-bold gradient-text-primary">Compliance Dashboard</h2>
              <p className="text-muted-foreground text-lg">
                NIST & ISO 27001 Standards Alignment
              </p>
            </div>
          </div>
        </div>

        {/* Security Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {securityMetrics.map((metric, index) => {
            const Icon = metric.icon;
            return (
              <Card 
                key={metric.label}
                className="glass border-2 animate-fade-in-up"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <Icon className={`w-5 h-5 ${metric.color}`} />
                    <Badge variant="outline" className="text-xs">Live</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold mb-1">{metric.value}</div>
                  <div className="text-sm text-muted-foreground">{metric.label}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* NIST Framework */}
        <Card className="glass border-2 mb-8 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                  {nistCompliance.category}
                </CardTitle>
                <CardDescription className="text-base mt-2">
                  Framework for improving critical infrastructure cybersecurity
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-green-500">{nistCompliance.score}%</div>
                <div className="text-sm text-muted-foreground">Compliance</div>
              </div>
            </div>
            <Progress value={nistCompliance.score} className="mt-4 h-3" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {nistCompliance.items.map((item, index) => (
                <div 
                  key={index}
                  className="p-4 rounded-lg border border-border/50 bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-lg">{item.name}</h4>
                    {getStatusBadge(item.status)}
                  </div>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ISO 27001 */}
        <Card className="glass border-2 mb-8 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl flex items-center gap-2">
                  <CheckCircle2 className="w-6 h-6 text-green-500" />
                  {isoCompliance.category}
                </CardTitle>
                <CardDescription className="text-base mt-2">
                  International standard for information security management
                </CardDescription>
              </div>
              <div className="text-right">
                <div className="text-4xl font-bold text-green-500">{isoCompliance.score}%</div>
                <div className="text-sm text-muted-foreground">Compliance</div>
              </div>
            </div>
            <Progress value={isoCompliance.score} className="mt-4 h-3" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isoCompliance.items.map((item, index) => (
                <div 
                  key={index}
                  className="p-4 rounded-lg border border-border/50 bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="font-semibold text-lg">{item.name}</h4>
                    {getStatusBadge(item.status)}
                  </div>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Blockchain Security Features */}
        <Card className="glass border-2 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
          <CardHeader>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Activity className="w-6 h-6 text-primary" />
              BlockDAG Blockchain Integration
            </CardTitle>
            <CardDescription className="text-base mt-2">
              Additional security through distributed ledger technology
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border border-primary/30 bg-primary/5">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Immutable Audit Trail
                </h4>
                <p className="text-sm text-muted-foreground">
                  All access requests and data transfers recorded on blockchain
                </p>
              </div>
              <div className="p-4 rounded-lg border border-primary/30 bg-primary/5">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Cryptographic Signatures
                </h4>
                <p className="text-sm text-muted-foreground">
                  MetaMask wallet signatures verify identity for all sensitive operations
                </p>
              </div>
              <div className="p-4 rounded-lg border border-primary/30 bg-primary/5">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Decentralized Storage
                </h4>
                <p className="text-sm text-muted-foreground">
                  No single point of failure with distributed data architecture
                </p>
              </div>
              <div className="p-4 rounded-lg border border-primary/30 bg-primary/5">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Time-Bound Access
                </h4>
                <p className="text-sm text-muted-foreground">
                  Automatic expiration of data access grants with revocation capability
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Footer />
    </div>
  );
};

export default Compliance;