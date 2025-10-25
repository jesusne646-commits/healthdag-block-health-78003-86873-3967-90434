import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { QRCodeSVG } from "qrcode.react";
import { Download } from "lucide-react";

interface ShareQRCodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patientId: string;
  recordIds: string[];
  patientWallet: string;
}

export const ShareQRCodeDialog = ({ open, onOpenChange, patientId, recordIds, patientWallet }: ShareQRCodeDialogProps) => {
  // Create QR data with patient info and record IDs
  const qrData = JSON.stringify({
    type: "medical_records_access",
    patientId,
    recordIds,
    patientWallet,
    encryptionKey: `KEY_${patientId.substring(0, 8)}`,
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-xl">Share via QR Code</DialogTitle>
          <DialogDescription>
            Healthcare providers can scan this QR code to request access to your medical records
          </DialogDescription>
        </DialogHeader>
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
      </DialogContent>
    </Dialog>
  );
};
