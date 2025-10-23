import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useMetaMask } from "@/hooks/useMetaMask";
import { UserPlus } from "lucide-react";

type RequestAccessDialogProps = {
  patientWalletAddress: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export const RequestAccessDialog = ({ patientWalletAddress, open, onOpenChange }: RequestAccessDialogProps) => {
  const [loading, setLoading] = useState(false);
  const [resourceType, setResourceType] = useState("");
  const [reason, setReason] = useState("");
  const [requesterName, setRequesterName] = useState("");
  const { toast } = useToast();
  const { account } = useMetaMask();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!account) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your MetaMask wallet first",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Get patient user_id from wallet address (simplified - in production, use proper mapping)
      const { data: profiles } = await (supabase as any)
        .from("profiles")
        .select("id")
        .eq("wallet_address", patientWalletAddress)
        .single();

      if (!profiles) {
        throw new Error("Patient not found");
      }

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // Request expires in 7 days

      const { error } = await (supabase as any)
        .from("access_requests")
        .insert({
          patient_id: profiles.id,
          requester_wallet_address: account,
          requester_name: requesterName || null,
          resource_type: resourceType,
          reason: reason || null,
          expires_at: expiresAt.toISOString(),
        });

      if (error) throw error;

      toast({
        title: "Access Request Sent",
        description: "The patient will be notified of your request",
      });

      // Reset form
      setResourceType("");
      setReason("");
      setRequesterName("");
      onOpenChange?.(false);
    } catch (error) {
      console.error("Error requesting access:", error);
      toast({
        title: "Error",
        description: "Failed to send access request",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <UserPlus className="w-4 h-4" />
          Request Access
        </Button>
      </DialogTrigger>
      <DialogContent className="glass max-w-md">
        <DialogHeader>
          <DialogTitle>Request Medical Record Access</DialogTitle>
          <DialogDescription>
            Request permission from the patient to access their encrypted medical records
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="requester-name">Your Name (Optional)</Label>
            <Input
              id="requester-name"
              placeholder="Dr. John Smith"
              value={requesterName}
              onChange={(e) => setRequesterName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="resource-type">Record Type *</Label>
            <Select value={resourceType} onValueChange={setResourceType} required>
              <SelectTrigger id="resource-type">
                <SelectValue placeholder="Select record type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="medical_records">Medical Records</SelectItem>
                <SelectItem value="medical_bills">Medical Bills</SelectItem>
                <SelectItem value="appointments">Appointments</SelectItem>
                <SelectItem value="all">All Records</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Request (Optional)</Label>
            <Textarea
              id="reason"
              placeholder="I need to review your medical history for treatment planning..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
            />
          </div>

          <div className="p-3 bg-muted/30 rounded-lg text-sm text-muted-foreground">
            <p className="mb-1">Patient Wallet:</p>
            <p className="font-mono text-xs break-all">{patientWalletAddress}</p>
          </div>

          <div className="flex gap-2">
            <Button type="submit" disabled={loading || !resourceType} className="flex-1">
              {loading ? "Sending..." : "Send Request"}
            </Button>
            <Button type="button" variant="outline" onClick={() => onOpenChange?.(false)}>
              Cancel
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
