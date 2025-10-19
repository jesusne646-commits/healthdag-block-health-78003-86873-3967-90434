import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, FileText, Download, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import healthdagLogo from "@/assets/healthdag-logo.png";
import Footer from "@/components/Footer";
import { SignaturePrompt } from "@/components/SignaturePrompt";
import { useSignature } from "@/hooks/useSignature";

type Record = {
  id: string;
  record_type: string;
  title: string;
  description: string;
  file_url: string | null;
  created_at: string;
};

const Records = () => {
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingSummary, setLoadingSummary] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [aiSummary, setAiSummary] = useState("");
  const [accessGranted, setAccessGranted] = useState(false);
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

    // Show notification about encrypted feature
    toast({
      title: "🔒 Encrypted Medical Records",
      description: "This feature is fully encrypted on the blockchain. Please sign with your wallet to securely access your medical records.",
      duration: 6000,
    });

    // Request signature to access encrypted records
    const message = `Accessing encrypted medical records at ${new Date().toLocaleString()}`;
    const signature = await requestSignature(message);
    
    if (!signature) {
      toast({
        title: "Access Denied",
        description: "You must sign to access your encrypted medical records",
        variant: "destructive",
      });
      navigate("/dashboard");
      return;
    }

    setAccessGranted(true);
    fetchRecords();
  };

  const fetchRecords = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data, error } = await (supabase as any)
      .from("medical_records")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Error",
        description: "Failed to load records",
        variant: "destructive",
      });
    } else {
      setRecords(data || []);
    }
    setLoading(false);
  };

  const handleGetAISummary = async () => {
    if (records.length === 0) {
      toast({
        title: "No Records",
        description: "You need medical records to generate a summary",
        variant: "destructive",
      });
      return;
    }

    setLoadingSummary(true);
    try {
      const { data, error } = await supabase.functions.invoke('medical-summary');
      
      if (error) {
        throw error;
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setAiSummary(data.summary);
      setShowSummary(true);
    } catch (error) {
      console.error('Error getting AI summary:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to generate AI summary",
        variant: "destructive",
      });
    } finally {
      setLoadingSummary(false);
    }
  };

  if (!accessGranted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/20">
      <header className="border-b border-primary/20 bg-background/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <img src={healthdagLogo} alt="HealthDAG" className="w-8 h-8" />
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            Medical Records
          </h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2">Your Encrypted Health Records</h2>
            <p className="text-muted-foreground">All records are encrypted and stored securely on BlockDAG</p>
          </div>
          {records.length > 0 && (
            <Button 
              onClick={handleGetAISummary} 
              disabled={loadingSummary}
              className="gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {loadingSummary ? "Analyzing..." : "Get AI Health Summary"}
            </Button>
          )}
        </div>

        {records.length === 0 ? (
          <Card className="max-w-md mx-auto text-center py-12">
            <CardHeader>
              <CardTitle>No Records Found</CardTitle>
              <CardDescription>You don't have any medical records yet</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {records.map((record) => (
              <Card key={record.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <FileText className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{record.title}</CardTitle>
                        <CardDescription className="capitalize">{record.record_type}</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">{record.description}</p>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {new Date(record.created_at).toLocaleDateString()}
                    </span>
                    {record.file_url && (
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={showSummary} onOpenChange={setShowSummary}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" />
              AI Health Summary & Recommendations
            </DialogTitle>
            <DialogDescription>
              Based on your medical records, here's a personalized health analysis
            </DialogDescription>
          </DialogHeader>
          <div className="mt-4 prose prose-sm max-w-none">
            <div className="whitespace-pre-wrap text-sm">{aiSummary}</div>
          </div>
        </DialogContent>
      </Dialog>

      <SignaturePrompt
        open={isWaitingForSignature}
        title="Accessing Encrypted Records"
        description="Your medical records are encrypted on the blockchain. Please sign in your wallet to confirm your identity and access your health data."
      />

      <Footer />
    </div>
  );
};

export default Records;
