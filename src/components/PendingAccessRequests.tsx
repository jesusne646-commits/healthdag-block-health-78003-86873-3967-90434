import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { UserCheck, UserX, Clock, Shield } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { useSignature } from "@/hooks/useSignature";

type AccessRequest = {
  id: string;
  requester_wallet_address: string;
  requester_name: string | null;
  resource_type: string;
  reason: string | null;
  status: string;
  created_at: string;
  expires_at: string;
};

export const PendingAccessRequests = () => {
  const [requests, setRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const { toast } = useToast();
  const { requestSignature } = useSignature();

  useEffect(() => {
    fetchPendingRequests();
    
    // Set up realtime subscription
    const channel = supabase
      .channel('access_requests_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'access_requests'
        },
        () => {
          fetchPendingRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchPendingRequests = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await (supabase as any)
      .from("access_requests")
      .select("*")
      .eq("patient_id", user.id)
      .eq("status", "pending")
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false });

    if (!error) {
      setRequests(data || []);
    }
    setLoading(false);
  };

  const handleApprove = async (request: AccessRequest) => {
    setProcessingId(request.id);
    try {
      // Request signature for approval
      const message = `Approve access request from ${request.requester_wallet_address} for ${request.resource_type} at ${new Date().toLocaleString()}`;
      const signature = await requestSignature(message);
      
      if (!signature) {
        toast({
          title: "Approval Cancelled",
          description: "You must sign to approve the access request",
          variant: "destructive",
        });
        setProcessingId(null);
        return;
      }

      // Update request status
      const { error: updateError } = await (supabase as any)
        .from("access_requests")
        .update({ status: "approved" })
        .eq("id", request.id);

      if (updateError) throw updateError;

      // Create access grant
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // 7 days access

      const { error: grantError } = await (supabase as any)
        .from("access_grants")
        .insert({
          patient_id: (await supabase.auth.getUser()).data.user?.id,
          recipient_wallet_address: request.requester_wallet_address,
          recipient_name: request.requester_name,
          resource_type: request.resource_type,
          resource_ids: [], // All records of this type
          expires_at: expiresAt.toISOString(),
          signature,
          shared_encryption_key: "mock_key_" + Date.now(), // In production, generate proper shared key
        });

      if (grantError) throw grantError;

      // Log activity
      await (supabase as any).from("activity_logs").insert({
        user_id: (await supabase.auth.getUser()).data.user?.id,
        activity_type: "share",
        title: "Access Request Approved",
        description: `Granted ${request.resource_type} access to ${request.requester_wallet_address.substring(0, 10)}...`,
        metadata: { request_id: request.id, requester: request.requester_wallet_address }
      });

      toast({
        title: "Access Approved",
        description: `${request.requester_name || "Requester"} can now access your ${request.resource_type}`,
      });

      fetchPendingRequests();
    } catch (error) {
      console.error("Error approving request:", error);
      toast({
        title: "Error",
        description: "Failed to approve access request",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeny = async (request: AccessRequest) => {
    setProcessingId(request.id);
    try {
      const { error } = await (supabase as any)
        .from("access_requests")
        .update({ status: "denied" })
        .eq("id", request.id);

      if (error) throw error;

      // Log activity
      await (supabase as any).from("activity_logs").insert({
        user_id: (await supabase.auth.getUser()).data.user?.id,
        activity_type: "share",
        title: "Access Request Denied",
        description: `Denied ${request.resource_type} access to ${request.requester_wallet_address.substring(0, 10)}...`,
        metadata: { request_id: request.id, requester: request.requester_wallet_address }
      });

      toast({
        title: "Access Denied",
        description: "The access request has been denied",
      });

      fetchPendingRequests();
    } catch (error) {
      console.error("Error denying request:", error);
      toast({
        title: "Error",
        description: "Failed to deny access request",
        variant: "destructive",
      });
    } finally {
      setProcessingId(null);
    }
  };

  if (loading || requests.length === 0) {
    return null;
  }

  return (
    <Card className="glass border-2 border-yellow-500/30 animate-fade-in-up">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Shield className="w-5 h-5 text-yellow-500 animate-pulse" />
          Pending Access Requests
        </CardTitle>
        <CardDescription>
          Healthcare providers requesting access to your medical records
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {requests.map((request) => (
            <div
              key={request.id}
              className="p-4 rounded-lg border border-yellow-500/20 bg-yellow-500/5"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="font-semibold text-base mb-1">
                    {request.requester_name || "Healthcare Provider"}
                  </div>
                  <div className="font-mono text-xs text-muted-foreground">
                    {request.requester_wallet_address.substring(0, 16)}...
                    {request.requester_wallet_address.substring(request.requester_wallet_address.length - 6)}
                  </div>
                </div>
                <Badge className="bg-yellow-500/20 text-yellow-500 border-yellow-500/50">
                  Pending
                </Badge>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">Requesting:</span>
                  <span className="text-muted-foreground capitalize">{request.resource_type}</span>
                </div>
                {request.reason && (
                  <div className="text-sm">
                    <span className="font-medium">Reason:</span>
                    <p className="text-muted-foreground mt-1">{request.reason}</p>
                  </div>
                )}
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  Requested {formatDistanceToNow(new Date(request.created_at), { addSuffix: true })}
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={() => handleApprove(request)}
                  disabled={processingId === request.id}
                  className="flex-1 gap-2"
                  size="sm"
                >
                  <UserCheck className="w-4 h-4" />
                  {processingId === request.id ? "Processing..." : "Approve"}
                </Button>
                <Button
                  onClick={() => handleDeny(request)}
                  disabled={processingId === request.id}
                  variant="outline"
                  className="flex-1 gap-2"
                  size="sm"
                >
                  <UserX className="w-4 h-4" />
                  Deny
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
