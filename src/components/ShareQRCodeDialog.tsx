import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";
import { Download } from "lucide-react";
import { useEffect, useState } from "react";
import { useSignature } from "@/hooks/useSignature";
import { SignaturePrompt } from "./SignaturePrompt";
import { useToast } from "@/hooks/use-toast";

interface ShareQRCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
  recordIds: string[];
  patientWallet: string;
}

export const ShareQRCodeDialog = ({ open, onOpenChange, patientId, recordIds, patientWallet }: ShareQRCodeDialogProps) => {
  const [demoSignature, setDemoSignature] = useState<string>("");
  const [isReady, setIsReady] = useState(false);
  const { requestSignature, isWaitingForSignature } = useSignature();
  const { toast } = useToast();

  useEffect(() => {
    if (open && !demoSignature) {
      requestDemoSignature();
    }
  }, [open]);

  const requestDemoSignature = async () => {
    const message = `Demo: Granting access to medical records at ${new Date().toLocaleString()}`;
    const signature = await requestSignature(message);
    
    if (signature) {
      setDemoSignature(signature);
      setIsReady(true);
      toast({
        title: "QR Code Ready",
        description: "Your signature has been recorded for the demo",
      });
    } else {
      // Use fallback demo signature if user rejects
      const fallbackSig = `DEMO_SIG_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      setDemoSignature(fallbackSig);
      setIsReady(true);
      toast({
        title: "Demo Mode",
        description: "Using demo signature for QR code",
      });
    }
  };

  // Create QR data with patient info, record IDs, and demo signature
  const qrData = JSON.stringify({
    type: "medical_records_access",
    patientId,
    recordIds,
    patientWallet,
    demoSignature: demoSignature || "PENDING",
    demoEncryptionKey: `DEMO_KEY_${patientId.substring(0, 8)}`,
    timestamp: Date.now(),
    expiresIn: 24 * 60 * 60 * 1000, // 24 hours
  });

  const handleDownloadQR = () => {
    const canvas = document.querySelector("svg");
    if (!canvas) return;

    const svgData = new XMLSerializer().serializeToString(canvas);
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "medical-records-qr.svg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <>
      <SignaturePrompt
        open={isWaitingForSignature}
        title="Demo Signature Required"
        description="For this demo, please sign to include your signature in the QR code. This simulates patient approval."
      />

      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle className="text-xl">Share via QR Code</DialogTitle>
            <DialogDescription>
              Healthcare providers can scan this QR code to request access to your medical records
            </DialogDescription>
          </DialogHeader>
          {!isReady ? (
            <div className="flex flex-col items-center gap-4 py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary/30 border-t-primary"></div>
              <p className="text-sm text-muted-foreground">Preparing QR code...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-6 py-6">
              <div className="p-6 bg-white rounded-xl shadow-lg">
                <QRCodeSVG
                  value={qrData}
                  size={384}
                  level="H"
                  includeMargin={true}
                />
              </div>
          <div className="text-center space-y-2">
            <p className="text-sm text-muted-foreground">
              This QR code is valid for 24 hours
            </p>
            <p className="text-xs text-muted-foreground">
              You'll need to confirm access after the doctor scans this code
            </p>
          </div>
              <Button onClick={handleDownloadQR} variant="outline" className="w-full gap-2">
                <Download className="w-4 h-4" />
                Download QR Code
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
