import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, QrCode, FileText, Stethoscope, Shield, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Html5Qrcode } from "html5-qrcode";
import healthdagLogo from "@/assets/healthdag-logo.png";
import Footer from "@/components/Footer";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/LanguageToggle";
import { EncryptionNotice } from "@/components/EncryptionNotice";

type Record = {
  id: string;
  record_type: string;
  title: string;
  description: string;
  file_url: string | null;
  created_at: string;
};

const DoctorDashboard = () => {
  const [searchParams] = useSearchParams();
  const [scanning, setScanning] = useState(false);
  const [scannedData, setScannedData] = useState<any>(null);
  const [doctorWallet, setDoctorWallet] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [requestingSent, setRequestSent] = useState(false);
  const [waitingForApproval, setWaitingForApproval] = useState(false);
  const [grantedRecords, setGrantedRecords] = useState<Record[]>([]);
  const [accessGrantId, setAccessGrantId] = useState<string | null>(null);
  const [html5QrCode, setHtml5QrCode] = useState<Html5Qrcode | null>(null);
  const [uploadingReport, setUploadingReport] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if there's QR data in URL params (for manual testing)
    const qrData = searchParams.get("qr");
    if (qrData) {
      try {
        const parsed = JSON.parse(decodeURIComponent(qrData));
        handleQRDataReceived(parsed);
      } catch (error) {
        console.error("Failed to parse QR data from URL:", error);
      }
    }
  }, [searchParams]);

  useEffect(() => {
    if (accessGrantId) {
      // Subscribe to access_grants changes
      const channel = supabase
        .channel('access-grant-changes')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'access_grants',
            filter: `id=eq.${accessGrantId}`
          },
          (payload) => {
            console.log('Access grant updated:', payload);
            if (payload.new && !payload.new.revoked) {
              fetchGrantedRecords(payload.new.resource_ids);
              setWaitingForApproval(false);
              toast({
                title: "Access Granted!",
                description: "Patient approved your access request",
              });
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [accessGrantId]);

  const handleQRDataReceived = (data: any) => {
    if (data.type === "medical_records_access") {
      // Check if QR code is expired
      const expirationTime = data.timestamp + data.expiresIn;
      if (Date.now() > expirationTime) {
        toast({
          title: "QR Code Expired",
          description: "This QR code has expired. Please request a new one.",
          variant: "destructive",
        });
        return;
      }
      setScannedData(data);
      toast({
        title: "QR Code Scanned",
        description: "Please enter your details to request access",
      });
    }
  };

  const startQRScanner = async () => {
    try {
      setScanning(true);
      
      // Clean up existing instance if any
      if (html5QrCode) {
        try {
          await html5QrCode.stop();
        } catch (e) {
          // Ignore cleanup errors
        }
      }

      const qrCodeScanner = new Html5Qrcode("qr-reader");
      setHtml5QrCode(qrCodeScanner);
      
      await qrCodeScanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        },
        (decodedText) => {
          try {
            const data = JSON.parse(decodedText);
            handleQRDataReceived(data);
            qrCodeScanner.stop().then(() => {
              setScanning(false);
              setHtml5QrCode(null);
            });
          } catch (error) {
            console.error("Failed to parse QR code:", error);
            toast({
              title: "Invalid QR Code",
              description: "This QR code is not valid for medical records access",
              variant: "destructive",
            });
          }
        },
        (errorMessage) => {
          // Ignore scan errors - they happen continuously while scanning
        }
      );
    } catch (error: any) {
      console.error("Failed to start QR scanner:", error);
      toast({
        title: "Camera Error",
        description: error?.message || "Failed to access camera. Please check permissions.",
        variant: "destructive",
      });
      setScanning(false);
      setHtml5QrCode(null);
    }
  };

  const stopQRScanner = async () => {
    if (html5QrCode) {
      try {
        await html5QrCode.stop();
      } catch (error) {
        console.error("Error stopping scanner:", error);
      }
    }
    setScanning(false);
    setHtml5QrCode(null);
  };

  const handleRequestAccess = async () => {
    if (!doctorWallet || !scannedData) {
      toast({
        title: "Missing Information",
        description: "Please enter your wallet address",
        variant: "destructive",
      });
      return;
    }

    setWaitingForApproval(true);

    try {
      // Create access grant (pending approval)
      const { data: grantData, error: grantError } = await (supabase as any)
        .from("access_grants")
        .insert({
          patient_id: scannedData.patientId,
          resource_ids: scannedData.recordIds,
          recipient_wallet_address: doctorWallet,
          recipient_name: doctorName || "Healthcare Provider",
          resource_type: "medical_records",
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          shared_encryption_key: "pending_approval",
          signature: "pending_approval",
          revoked: true, // Start as revoked, patient will approve
        })
        .select()
        .single();

      if (grantError) throw grantError;

      setAccessGrantId(grantData.id);
      setRequestSent(true);

      // Create access request for patient notification
      await (supabase as any)
        .from("access_requests")
        .insert({
          patient_id: scannedData.patientId,
          requester_wallet_address: doctorWallet,
          requester_name: doctorName || "Healthcare Provider",
          resource_type: "medical_records",
          reason: "QR Code scan - Access request from healthcare provider",
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          status: "pending",
        });

      toast({
        title: "Request Sent",
        description: "Waiting for patient approval...",
      });
    } catch (error: any) {
      console.error("Error requesting access:", error);
      setWaitingForApproval(false);
      toast({
        title: "Error",
        description: error.message || "Failed to send access request",
        variant: "destructive",
      });
    }
  };

  const fetchGrantedRecords = async (recordIds: string[]) => {
    try {
      const { data, error } = await (supabase as any)
        .from("medical_records")
        .select("*")
        .in("id", recordIds);

      if (error) throw error;
      setGrantedRecords(data || []);
    } catch (error) {
      console.error("Error fetching records:", error);
    }
  };

  const handleUploadReport = async (recordId: string, file: File) => {
    if (!doctorWallet) {
      toast({
        title: "Error",
        description: "Wallet address not found",
        variant: "destructive",
      });
      return;
    }

    setUploadingReport(true);
    try {
      // In a real implementation, this would upload to storage and create a new medical record
      // For demo purposes, we'll just show a success message
      await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate upload
      
      toast({
        title: "Report Uploaded",
        description: `Medical report "${file.name}" has been uploaded successfully`,
      });
    } catch (error: any) {
      console.error("Error uploading report:", error);
      toast({
        title: "Upload Failed",
        description: error.message || "Failed to upload medical report",
        variant: "destructive",
      });
    } finally {
      setUploadingReport(false);
    }
  };

  return (
    <>
      <EncryptionNotice
        open={waitingForApproval}
        title="🔒 Waiting for Patient Approval"
        description="The patient's medical records are encrypted. Please wait while the patient confirms your access request through their wallet signature."
      />

      <div className="min-h-screen bg-gradient-mesh relative overflow-hidden">
        <header className="border-b border-primary/20 bg-background/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <img src={healthdagLogo} alt="HealthDAG" className="w-8 h-8" />
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Healthcare Provider Portal
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <LanguageToggle />
              <ThemeToggle />
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto space-y-8">
            {/* Header */}
            <div className="text-center animate-fade-in">
              <div className="inline-flex p-4 bg-primary/10 rounded-full mb-4">
                <Stethoscope className="w-12 h-12 text-primary" />
              </div>
              <h2 className="text-3xl font-bold mb-2 gradient-text-primary">
                Access Patient Records
              </h2>
              <p className="text-muted-foreground text-lg">
                Scan patient QR code to request secure access to medical records
              </p>
            </div>

            {!scannedData && !grantedRecords.length && (
              <Card className="glass border-2 animate-fade-in-up">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <QrCode className="w-6 h-6" />
                    Scan Patient QR Code
                  </CardTitle>
                  <CardDescription>
                    Use your camera to scan the patient's medical record QR code
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {!scanning ? (
                    <Button onClick={startQRScanner} className="w-full" size="lg">
                      <QrCode className="w-5 h-5 mr-2" />
                      Start QR Scanner
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      <div id="qr-reader" className="w-full rounded-lg overflow-hidden border-2 border-primary/20"></div>
                      <Button onClick={stopQRScanner} variant="outline" className="w-full">
                        Cancel Scan
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {scannedData && !requestingSent && (
              <Card className="glass border-2 animate-fade-in-up">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Shield className="w-6 h-6 text-primary" />
                    Request Access
                  </CardTitle>
                  <CardDescription>
                    Enter your details to request access to patient records
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="doctorWallet">Your Wallet Address *</Label>
                    <Input
                      id="doctorWallet"
                      placeholder="0x..."
                      value={doctorWallet}
                      onChange={(e) => setDoctorWallet(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="doctorName">Your Name (Optional)</Label>
                    <Input
                      id="doctorName"
                      placeholder="Dr. John Smith"
                      value={doctorName}
                      onChange={(e) => setDoctorName(e.target.value)}
                    />
                  </div>
                  <div className="bg-primary/10 p-4 rounded-lg border border-primary/20">
                    <p className="text-sm text-muted-foreground">
                      <strong>Note:</strong> The patient will receive a notification and must approve 
                      your access request by signing with their wallet. This ensures their medical 
                      records remain secure and encrypted.
                    </p>
                  </div>
                  <Button 
                    onClick={handleRequestAccess} 
                    className="w-full" 
                    size="lg"
                    disabled={!doctorWallet}
                  >
                    Send Access Request
                  </Button>
                </CardContent>
              </Card>
            )}

            {grantedRecords.length > 0 && (
              <div className="space-y-6 animate-fade-in-up">
                <div className="text-center">
                  <div className="inline-flex p-3 bg-green-500/10 rounded-full mb-3">
                    <FileText className="w-8 h-8 text-green-500" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Access Granted</h3>
                  <p className="text-muted-foreground">
                    You now have access to the patient's medical records
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {grantedRecords.map((record) => (
                    <Card key={record.id} className="glass border-2 card-hover-lift">
                      <CardHeader>
                        <div className="flex items-center gap-3 mb-2">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <FileText className="w-5 h-5 text-primary" />
                          </div>
                        </div>
                        <CardTitle className="text-lg">{record.title}</CardTitle>
                        <CardDescription className="capitalize">
                          {record.record_type}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <p className="text-sm text-muted-foreground mb-4">
                          {record.description}
                        </p>
                        <div className="flex justify-between items-center p-3 bg-muted/30 rounded-lg">
                          <span className="text-sm font-medium">Date:</span>
                          <span className="text-sm text-muted-foreground">
                            {new Date(record.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        
                        {record.file_url && (
                          <Button 
                            variant="outline" 
                            className="w-full"
                            onClick={() => window.open(record.file_url!, '_blank')}
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            View Document
                          </Button>
                        )}

                        <div className="pt-2 border-t border-border">
                          <Label htmlFor={`upload-${record.id}`} className="text-sm font-medium mb-2 block">
                            Upload Additional Report
                          </Label>
                          <Input
                            id={`upload-${record.id}`}
                            type="file"
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                handleUploadReport(record.id, file);
                                e.target.value = ''; // Reset input
                              }
                            }}
                            disabled={uploadingReport}
                            className="cursor-pointer"
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Upload lab results, prescriptions, or notes
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        <Footer />
      </div>
    </>
  );
};

export default DoctorDashboard;
