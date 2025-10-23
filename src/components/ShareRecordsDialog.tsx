import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useSignature } from "@/hooks/useSignature";
import { Share2, Shield, Clock } from "lucide-react";

type Record = {
  id: string;
  title: string;
  record_type: string;
};

interface ShareRecordsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  records: Record[];
  onSuccess: () => void;
}

export const ShareRecordsDialog = ({ open, onOpenChange, records, onSuccess }: ShareRecordsDialogProps) => {
  const [selectedRecords, setSelectedRecords] = useState<string[]>([]);
  const [recipientAddress, setRecipientAddress] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [expirationHours, setExpirationHours] = useState("24");
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const { requestSignature } = useSignature();

  const handleShare = async () => {
    if (selectedRecords.length === 0) {
      toast({
        title: "No Records Selected",
        description: "Please select at least one record to share",
        variant: "destructive",
      });
      return;
    }

    if (!recipientAddress || !recipientAddress.startsWith("0x")) {
      toast({
        title: "Invalid Address",
        description: "Please enter a valid wallet address (starting with 0x)",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Request signature for authorization
      const message = `Granting access to ${selectedRecords.length} medical records to ${recipientAddress} for ${expirationHours} hours`;
      const signature = await requestSignature(message);
      
      if (!signature) {
        throw new Error("Signature required to share records");
      }

      // Generate a shared encryption key (in production, use ECDH)
      const sharedKey = `shared_${Date.now()}_${Math.random().toString(36).substring(7)}`;
      
      // Calculate expiration
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + parseInt(expirationHours));

      // Create access grant
      const { error } = await (supabase as any)
        .from("access_grants")
        .insert({
          patient_id: user.id,
          recipient_wallet_address: recipientAddress.toLowerCase(),
          recipient_name: recipientName || null,
          resource_type: "medical_records",
          resource_ids: selectedRecords,
          shared_encryption_key: sharedKey,
          expires_at: expiresAt.toISOString(),
          signature,
          metadata: {
            records_count: selectedRecords.length,
            granted_at: new Date().toISOString(),
          }
        });

      if (error) throw error;

      // Log activity
      await (supabase as any)
        .from("activity_logs")
        .insert({
          user_id: user.id,
          activity_type: "share",
          title: "Records Shared",
          description: `Shared ${selectedRecords.length} medical records with ${recipientName || recipientAddress.substring(0, 10)}...`,
          metadata: {
            recipient_address: recipientAddress,
            records_count: selectedRecords.length,
            expires_at: expiresAt.toISOString(),
          }
        });

      toast({
        title: "✅ Access Granted",
        description: `Successfully shared ${selectedRecords.length} records. Access expires in ${expirationHours} hours.`,
      });

      setSelectedRecords([]);
      setRecipientAddress("");
      setRecipientName("");
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error("Share error:", error);
      toast({
        title: "Sharing Failed",
        description: error instanceof Error ? error.message : "Failed to share records",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const toggleRecord = (recordId: string) => {
    setSelectedRecords(prev =>
      prev.includes(recordId)
        ? prev.filter(id => id !== recordId)
        : [...prev, recordId]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto glass">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Share2 className="w-6 h-6 text-primary" />
            Share Medical Records
          </DialogTitle>
          <DialogDescription className="text-base">
            Grant time-limited access to selected records. Recipient must have a blockchain wallet.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Recipient Information */}
          <div className="space-y-4 p-4 rounded-lg border border-border/50 bg-muted/30">
            <div className="flex items-center gap-2 mb-2">
              <Shield className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Recipient Information</h3>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="recipient-address">Wallet Address *</Label>
              <Input
                id="recipient-address"
                placeholder="0x..."
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                className="font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="recipient-name">Name (Optional)</Label>
              <Input
                id="recipient-name"
                placeholder="Dr. Smith, General Hospital"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiration" className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Access Duration
              </Label>
              <Select value={expirationHours} onValueChange={setExpirationHours}>
                <SelectTrigger id="expiration">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 hour</SelectItem>
                  <SelectItem value="6">6 hours</SelectItem>
                  <SelectItem value="24">24 hours (recommended)</SelectItem>
                  <SelectItem value="72">3 days</SelectItem>
                  <SelectItem value="168">1 week</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Record Selection */}
          <div className="space-y-4">
            <h3 className="font-semibold">Select Records to Share</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto p-4 rounded-lg border border-border/50 bg-muted/30">
              {records.map((record) => (
                <div
                  key={record.id}
                  className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    id={record.id}
                    checked={selectedRecords.includes(record.id)}
                    onCheckedChange={() => toggleRecord(record.id)}
                  />
                  <label
                    htmlFor={record.id}
                    className="flex-1 cursor-pointer"
                  >
                    <div className="font-medium">{record.title}</div>
                    <div className="text-sm text-muted-foreground capitalize">
                      {record.record_type}
                    </div>
                  </label>
                </div>
              ))}
            </div>
            <div className="text-sm text-muted-foreground">
              {selectedRecords.length} of {records.length} records selected
            </div>
          </div>

          {/* Security Notice */}
          <div className="p-4 rounded-lg border border-primary/30 bg-primary/5">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
              <div className="text-sm space-y-1">
                <p className="font-semibold">Security Notice</p>
                <p className="text-muted-foreground">
                  • You'll need to sign this transaction with your wallet
                </p>
                <p className="text-muted-foreground">
                  • Access automatically expires after the selected duration
                </p>
                <p className="text-muted-foreground">
                  • You can revoke access at any time from the Shared Access Log
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleShare}
              className="flex-1"
              disabled={loading || selectedRecords.length === 0}
            >
              {loading ? "Processing..." : "Grant Access"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};