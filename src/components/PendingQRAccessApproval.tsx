import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, Clock, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSignature } from "@/hooks/useSignature";
import { SignaturePrompt } from "./SignaturePrompt";

type PendingGrant = {
  id: string;
  patient_id: string;
  recipient_wallet_address: string;
  recipient_name: string;
  resource_ids: string[];
  created_at: string;
  expires_at: string;
};

export const PendingQRAccessApproval = () => {
  const [pendingGrants, setPendingGrants] = useState<PendingGrant[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { toast } = useToast();
  const { requestSignature, isWaitingForSignature } = useSignature();

  useEffect(() => {
    fetchPendingGrants();
    
    // Subscribe to new grants
    const channel = supabase
      .channel('pending-grants')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'access_grants',
        },
        () => {
          fetchPendingGrants();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPendingGrants = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await (supabase as any)
        .from("access_grants")
        .select("*")
        .eq("patient_id", user.id)
        .eq("revoked", true)
        .eq("signature", "pending_approval")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPendingGrants(data || []);
    } catch (error) {
      console.error("Error fetching pending grants:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (grant: PendingGrant) => {
    setProcessingId(grant.id);

    try {
      // Request wallet signature for approval
      const message = `Approve medical records access for ${grant.recipient_name} (${grant.recipient_wallet_address}) at ${new Date().toLocaleString()}`;
      const signature = await requestSignature(message);

      if (!signature) {
        toast({
          title: "Approval Cancelled",
          description: "You must sign to approve access",
          variant: "destructive",
        });
        setProcessingId(null);
        return;
      }

      // Generate encryption key (simulated for demo)
      const encryptionKey = `key_${Date.now()}_${Math.random().toString(36).substring(7)}`;

      // Update grant to approved
      const { error } = await (supabase as any)
        .from("access_grants")
        .update({
          revoked: false,
          signature: signature,
          shared_encryption_key: encryptionKey,
        })
        .eq("id", grant.id);

      if (error) throw error;

      // Update corresponding access request
      await (supabase as any)
        .from("access_requests")
        .update({ status: "approved", responded_at: new Date().toISOString() })
        .eq("patient_id", grant.patient_id)
        .eq("requester_wallet_address", grant.recipient_wallet_address)
        .eq("status", "pending");

      // Log activity
      await (supabase as any)
        .from("activity_logs")
        .insert({
          user_id: grant.patient_id,
          activity_type: "access_grant",
          title: "Access Granted",
          description: `Granted access to ${grant.recipient_name}`,
          metadata: { grant_id: grant.id, recipient: grant.recipient_wallet_address },
        });

      toast({
        title: "Access Approved",
        description: `${grant.recipient_name} can now view your medical records`,
      });

      fetchPendingGrants();
    } catch (error: any) {
      console.error("Error approving access:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to approve access",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeny = async (grant: PendingGrant) => {
    setProcessingId(grant.id);

    try {
      // Delete the grant
      const { error: deleteError } = await (supabase as any)
        .from("access_grants")
        .delete()
        .eq("id", grant.id);

      if (deleteError) throw deleteError;

      // Update access request to denied
      await (supabase as any)
        .from("access_requests")
        .update({ status: "denied", responded_at: new Date().toISOString() })
        .eq("patient_id", grant.patient_id)
        .eq("requester_wallet_address", grant.recipient_wallet_address)
        .eq("status", "pending");

      toast({
        title: "Access Denied",
        description: `Denied access request from ${grant.recipient_name}`,
      });

      fetchPendingGrants();
    } catch (error: any) {
      console.error("Error denying access:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to deny access",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  if (loading || pendingGrants.length === 0) {
    return null;
  }

  return (
    <>
      <SignaturePrompt
        open={isWaitingForSignature}
        title="Approve Access Request"
        description="Please sign with your wallet to securely approve access to your encrypted medical records."
      />

      <Card className="glass border-2 border-primary/30 animate-fade-in">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Pending Access Approvals
            <Badge variant="default" className="ml-auto">
              {pendingGrants.length}
            </Badge>
          </CardTitle>
          <CardDescription>
            Healthcare providers are requesting access to your medical records via QR scan
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {pendingGrants.map((grant) => (
            <div
              key={grant.id}
              className="p-4 border rounded-lg bg-background/50 space-y-3 hover:border-primary/50 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold">{grant.recipient_name}</p>
                    <Badge variant="outline" className="gap-1">
                      <Clock className="w-3 h-3" />
                      Pending
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {grant.recipient_wallet_address}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Requested: {new Date(grant.created_at).toLocaleString()}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Records: {grant.resource_ids.length} medical record(s)
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => handleApprove(grant)}
                  disabled={processingId === grant.id}
                  className="flex-1 gap-2"
                  size="sm"
                >
                  <CheckCircle className="w-4 h-4" />
                  Approve Access
                </Button>
                <Button
                  onClick={() => handleDeny(grant)}
                  disabled={processingId === grant.id}
                  variant="destructive"
                  className="flex-1 gap-2"
                  size="sm"
                >
                  <XCircle className="w-4 h-4" />
                  Deny
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </>
  );
};
