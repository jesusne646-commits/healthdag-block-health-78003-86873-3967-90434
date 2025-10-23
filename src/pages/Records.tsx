import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ArrowLeft, FileText, Download, Sparkles, Share2 } from "lucide-react";
import { ShareRecordsDialog } from "@/components/ShareRecordsDialog";
import { SharedAccessLog } from "@/components/SharedAccessLog";
import { AccessRequestCard } from "@/components/AccessRequestCard";
import { useToast } from "@/hooks/use-toast";
import healthdagLogo from "@/assets/healthdag-logo.png";
import Footer from "@/components/Footer";
import { SignaturePrompt } from "@/components/SignaturePrompt";
import { EncryptionNotice } from "@/components/EncryptionNotice";
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
  const [showEncryptionNotice, setShowEncryptionNotice] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
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
    } catch (error) {
      setShowEncryptionNotice(false);
      console.error("Access signature error:", error);
    }
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

  return (
    <>
      <EncryptionNotice
        open={showEncryptionNotice}
        title="🔒 Encrypted Medical Records"
        description="This feature is fully encrypted on the blockchain. Please sign with your wallet to securely access your medical records."
      />

      <SignaturePrompt
        open={isWaitingForSignature}
        title="Accessing Encrypted Records"
        description="Your medical records are encrypted on the blockchain. Please sign in your wallet to confirm your identity and access your health data."
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

          <div className="container mx-auto px-4 py-8 relative z-10">
            <div className="mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 animate-fade-in">
              <div>
                <h2 className="text-3xl font-bold mb-2 gradient-text-primary">Your Encrypted Health Records</h2>
                <p className="text-muted-foreground text-lg">All records are encrypted and stored securely on BlockDAG</p>
              </div>
              {records.length > 0 && (
                <div className="flex gap-3">
                  <Button 
                    onClick={() => setShowShareDialog(true)}
                    variant="outline"
                    className="gap-2 shadow-button hover:shadow-button-hover transition-all duration-300"
                  >
                    <Share2 className="w-4 h-4" />
                    Share Records
                  </Button>
                  <Button 
                    onClick={handleGetAISummary} 
                    disabled={loadingSummary}
                    className="gap-2 shadow-button hover:shadow-button-hover transition-all duration-300"
                  >
                    <Sparkles className="w-4 h-4" />
                    {loadingSummary ? "Analyzing..." : "Get AI Health Summary"}
                  </Button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              <div className="lg:col-span-3">
                <AccessRequestCard />
              </div>
            </div>

            {records.length === 0 ? (
              <Card className="max-w-md mx-auto text-center py-16 glass border-2 animate-bounce-in">
                <CardHeader>
                  <div className="inline-flex p-4 bg-primary/10 rounded-full mb-4 mx-auto">
                    <FileText className="w-8 h-8 text-primary" />
                  </div>
                  <CardTitle className="text-2xl">No Records Found</CardTitle>
                  <CardDescription className="text-base mt-2">
                    You don't have any medical records yet
                  </CardDescription>
                </CardHeader>
              </Card>
            ) : (
              <>
              <div className="mb-8">{/* Records grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {records.map((record, index) => (
                  <Card 
                    key={record.id}
                    className="group card-hover-lift glass border-2 overflow-hidden relative animate-fade-in-up"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    {/* Gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-br from-primary to-accent opacity-0 group-hover:opacity-5 transition-opacity duration-300"></div>
                    
                    <CardHeader className="relative z-10">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-3 rounded-xl bg-gradient-to-br from-primary to-accent bg-opacity-10 group-hover:scale-110 transition-transform">
                            <FileText className="w-5 h-5 text-primary" />
                          </div>
                        </div>
                      </div>
                      <CardTitle className="text-xl font-bold group-hover:gradient-text-primary transition-all">
                        {record.title}
                      </CardTitle>
                      <CardDescription className="capitalize text-base font-medium">
                        {record.record_type}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="relative z-10">
                      <p className="text-sm text-muted-foreground mb-5 line-clamp-2">{record.description}</p>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                          <span className="text-sm font-medium">Date:</span>
                          <span className="text-sm text-muted-foreground">
                            {new Date(record.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        {record.file_url && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="w-full hover:scale-105 transition-transform"
                          >
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </Button>
                        )}
                      </div>
                    </CardContent>

                    {/* Bottom accent line */}
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-accent transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                  </Card>
                ))}
              </div>
              </div>

              <SharedAccessLog />
              </>
            )}
          </div>

          <ShareRecordsDialog
            open={showShareDialog}
            onOpenChange={setShowShareDialog}
            records={records}
            onSuccess={() => {}}
          />

          <Dialog open={showSummary} onOpenChange={setShowSummary}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto glass">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-xl">
                  <Sparkles className="w-6 h-6 text-primary" />
                  AI Health Summary & Recommendations
                </DialogTitle>
                <DialogDescription className="text-base">
                  Based on your medical records, here's a personalized health analysis
                </DialogDescription>
              </DialogHeader>
              <div className="mt-4 prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap text-sm p-4 bg-muted/30 rounded-lg">{aiSummary}</div>
              </div>
            </DialogContent>
          </Dialog>

          <Footer />
        </div>
      )}
    </>
  );
};

export default Records;
