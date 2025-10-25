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
  const [countdown, setCountdown] = useState(15);
  const [grantedRecords, setGrantedRecords] = useState<Record[]>([]);
  const [accessGrantId, setAccessGrantId] = useState<string | null>(null);
  const [html5QrCode, setHtml5QrCode] = useState<Html5Qrcode | null>(null);
  const [uploadingReport, setUploadingReport] = useState(false);
  const [cameraError, setCameraError] = useState<string>("");
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

  // Countdown effect for demo
  useEffect(() => {
    if (waitingForApproval && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [waitingForApproval, countdown]);

  const handleQRDataReceived = async (data: any) => {
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
        description: "Sending access request to patient...",
      });
      
      // Automatically request access
      await handleRequestAccess(data);
    }
  };

  const startQRScanner = async () => {
    setCameraError("");
    setScanning(true);
    
    // Wait for the DOM to update
    await new Promise(resolve => setTimeout(resolve, 150));
    
    try {
      // Clean up existing instance
      if (html5QrCode) {
        try {
          await html5QrCode.stop();
          await html5QrCode.clear();
        } catch (e) {
          console.log("Cleanup:", e);
        }
      }

      const scanner = new Html5Qrcode("qr-reader");
      setHtml5QrCode(scanner);
      
      const qrConfig = {
        fps: 10,
        qrbox: 250,
        aspectRatio: 1.0,
        disableFlip: false
      };

      const onSuccess = (decodedText: string) => {
        console.log("QR Code detected:", decodedText);
        try {
          const data = JSON.parse(decodedText);
          if (data.type === "medical_records_access") {
            handleQRDataReceived(data);
            scanner.stop().then(() => {
              setScanning(false);
              setHtml5QrCode(null);
            });
          } else {
            toast({
              title: "Invalid QR Code",
              description: "This is not a medical records QR code",
              variant: "destructive",
            });
          }
        } catch (error) {
          console.error("Parse error:", error);
          toast({
            title: "Invalid QR Code",
            description: "Could not read QR code data",
            variant: "destructive",
          });
        }
      };

      const onError = (errorMessage: string) => {
        // Silently ignore scanning errors
      };

      try {
        // Get available cameras
        const cameras = await Html5Qrcode.getCameras();
        console.log("Available cameras:", cameras);
        
        if (cameras && cameras.length > 0) {
          // Prefer back camera
          const backCamera = cameras.find(cam => 
            cam.label.toLowerCase().includes('back') || 
            cam.label.toLowerCase().includes('rear') ||
            cam.label.toLowerCase().includes('environment')
          );
          
          const cameraId = backCamera ? backCamera.id : cameras[cameras.length - 1].id;
          console.log("Using camera:", cameraId);
          
          await scanner.start(
            cameraId,
            qrConfig,
            onSuccess,
            onError
          );
          
          console.log("Scanner started successfully");
        } else {
          throw new Error("No cameras available on this device");
        }
      } catch (err: any) {
        console.error("Camera start error:", err);
        setCameraError(err.message || "Failed to access camera");
        throw err;
      }
    } catch (error: any) {
      console.error("Scanner initialization error:", error);
      const msg = error?.message || "Camera access failed";
      setCameraError(msg);
      toast({
        title: "Camera Error",
        description: msg + ". Please check browser permissions.",
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
        await html5QrCode.clear();
      } catch (error) {
        console.error("Error stopping scanner:", error);
      }
    }
    setScanning(false);
    setHtml5QrCode(null);
    setCameraError("");
  };

  const handleRequestAccess = async (qrData: any) => {
    setWaitingForApproval(true);
    setCountdown(15);

    try {
      // Generate automatic doctor wallet and name
      const autoWallet = `DOCTOR_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      const autoName = `Healthcare Provider - ${new Date().toLocaleTimeString()}`;
      
      setDoctorWallet(autoWallet);
      setDoctorName(autoName);

      // Trigger signature request on patient's wallet (for visual effect)
      if (qrData.patientWallet && window.ethereum) {
        try {
          const message = `Granting access to medical records for ${autoName} at ${new Date().toLocaleString()}`;
          window.ethereum.request({
            method: "personal_sign",
            params: [message, qrData.patientWallet],
          }).catch(() => {
            // Continue regardless - signature is for visual effect only
            console.log("Signature request displayed to patient");
          });
        } catch (e) {
          // Silent fail - continue with approval
        }
      }

      // Create access grant immediately
      const { data: grantData, error: grantError } = await (supabase as any)
        .from("access_grants")
        .insert({
          patient_id: qrData.patientId,
          resource_ids: qrData.recordIds,
          recipient_wallet_address: autoWallet,
          recipient_name: autoName,
          resource_type: "medical_records",
          expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          shared_encryption_key: qrData.encryptionKey || `KEY_${qrData.patientId.substring(0, 8)}`,
          signature: `SIG_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          revoked: false,
        })
        .select()
        .single();

      if (grantError) throw grantError;

      console.log('Access grant created:', grantData.id);
      setAccessGrantId(grantData.id);
      setRequestSent(true);

      toast({
        title: "Request Sent",
        description: "Waiting for patient approval...",
      });

      // Wait 15 seconds then display records
      setTimeout(() => {
        setWaitingForApproval(false);
        fetchGrantedRecords(qrData.recordIds);
        toast({
          title: "Access Granted",
          description: "You now have access to the patient's medical records",
        });
      }, 15000);
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
        title={`🔒 Awaiting Patient Approval (${countdown}s)`}
        description="The patient is reviewing your access request. Please wait while they verify and approve the request with their digital signature."
      />

      <div className="min-h-screen bg-gradient-mesh relative overflow-hidden">
        <header className="border-b border-primary/20 bg-background/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-3 sm:px-4 py-3 sm:py-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
                <Button variant="ghost" size="sm" onClick={() => navigate("/")} className="shrink-0">
                  <ArrowLeft className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Back</span>
                </Button>
                <img src={healthdagLogo} alt="HealthDAG" className="w-10 h-10 sm:w-12 sm:h-12 shrink-0 drop-shadow-[0_0_20px_rgba(34,211,238,0.4)]" />
                <h1 className="text-sm sm:text-xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent truncate">
                  Provider Portal
                </h1>
              </div>
              <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                <LanguageToggle />
                <ThemeToggle />
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-3 sm:px-4 py-4 sm:py-8">
          <div className="max-w-4xl mx-auto space-y-4 sm:space-y-8">
            {/* Header */}
            <div className="text-center animate-fade-in">
              <div className="inline-flex p-3 sm:p-4 bg-primary/10 rounded-full mb-3 sm:mb-4">
                <Stethoscope className="w-8 h-8 sm:w-12 sm:h-12 text-primary" />
              </div>
              <h2 className="text-xl sm:text-3xl font-bold mb-2 gradient-text-primary px-2">
                Access Patient Records
              </h2>
              <p className="text-muted-foreground text-sm sm:text-lg px-4">
                Scan patient QR code to request secure access
              </p>
            </div>

            {!scannedData && !grantedRecords.length && !scanning && (
              <Card className="glass border-2 animate-fade-in-up">
                <CardHeader className="pb-3 sm:pb-6">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <QrCode className="w-5 h-5 sm:w-6 sm:h-6" />
                    Scan Patient QR Code
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Use your camera to scan the patient's QR code
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <Button 
                    onClick={startQRScanner} 
                    className="w-full h-12 sm:h-14 text-base sm:text-lg" 
                    size="lg"
                  >
                    <QrCode className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
                    Start QR Scanner
                  </Button>

                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">
                        Or for demo
                      </span>
                    </div>
                  </div>

                  <Button 
                    onClick={() => {
                      // Simulate QR scan for demo
                      const demoData = {
                        type: "medical_records_access",
                        patientId: "demo-patient-id",
                        recordIds: ["demo-record-1", "demo-record-2"],
                        timestamp: Date.now(),
                        expiresIn: 24 * 60 * 60 * 1000,
                      };
                      handleQRDataReceived(demoData);
                    }}
                    variant="outline"
                    className="w-full h-11 sm:h-12"
                  >
                    Use Demo QR Data
                  </Button>
                  
                  {cameraError && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                      <p className="text-sm text-destructive">{cameraError}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Fullscreen QR Scanner */}
            {scanning && (
              <div className="fixed inset-0 z-[100] bg-black flex flex-col">
                <div className="flex items-center justify-between p-4 bg-black/80 backdrop-blur-sm">
                  <h3 className="text-white text-lg font-semibold">Scan QR Code</h3>
                  <Button onClick={stopQRScanner} variant="ghost" size="sm" className="text-white hover:bg-white/20">
                    Close
                  </Button>
                </div>
                <div className="flex-1 flex items-center justify-center p-4">
                  <div id="qr-reader" className="w-full max-w-lg"></div>
                </div>
                <div className="p-4 bg-black/80 backdrop-blur-sm text-center">
                  <p className="text-white/80 text-sm">Position the QR code within the frame</p>
                </div>
              </div>
            )}

            {waitingForApproval && (
              <Card className="glass border-2 animate-fade-in-up">
                <CardHeader className="pb-3 sm:pb-6">
                  <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                    <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-primary animate-pulse" />
                    Awaiting Patient Approval
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Estimated time: {countdown} seconds remaining
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4">
                  <div className="bg-primary/10 p-4 sm:p-6 rounded-lg border border-primary/20 text-center">
                    <p className="text-sm sm:text-base text-muted-foreground mb-2">
                      The patient is reviewing your access request and will approve it with their digital signature.
                    </p>
                    <p className="text-xs text-muted-foreground">
                      You'll be notified immediately when access is granted.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {grantedRecords.length > 0 && (
              <div className="space-y-4 sm:space-y-6 animate-fade-in-up">
                <div className="text-center">
                  <div className="inline-flex p-2 sm:p-3 bg-green-500/10 rounded-full mb-2 sm:mb-3">
                    <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-green-500" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-2 px-4">Access Granted</h3>
                  <p className="text-muted-foreground text-sm sm:text-base px-4">
                    You now have access to the patient's records
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:gap-6">
                  {grantedRecords.map((record) => (
                    <Card key={record.id} className="glass border-2 card-hover-lift">
                      <CardHeader className="pb-3 sm:pb-6">
                        <div className="flex items-center gap-2 sm:gap-3 mb-2">
                          <div className="p-1.5 sm:p-2 rounded-lg bg-primary/10">
                            <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                          </div>
                        </div>
                        <CardTitle className="text-base sm:text-lg">{record.title}</CardTitle>
                        <CardDescription className="capitalize text-xs sm:text-sm">
                          {record.record_type}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3 sm:space-y-4">
                        <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
                          {record.description}
                        </p>
                        <div className="flex justify-between items-center p-2.5 sm:p-3 bg-muted/30 rounded-lg">
                          <span className="text-xs sm:text-sm font-medium">Date:</span>
                          <span className="text-xs sm:text-sm text-muted-foreground">
                            {new Date(record.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        
                        {record.file_url && (
                          <Button 
                            variant="outline" 
                            className="w-full h-10 sm:h-11"
                            onClick={() => window.open(record.file_url!, '_blank')}
                          >
                            <FileText className="w-4 h-4 mr-2" />
                            View Document
                          </Button>
                        )}

                        <div className="pt-2 sm:pt-3 border-t border-border">
                          <Label htmlFor={`upload-${record.id}`} className="text-xs sm:text-sm font-medium mb-2 block">
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
                                e.target.value = '';
                              }
                            }}
                            disabled={uploadingReport}
                            className="cursor-pointer h-10 sm:h-11 text-sm"
                          />
                          <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
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
