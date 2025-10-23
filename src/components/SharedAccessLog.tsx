import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Share2, Clock, XCircle, CheckCircle2, AlertCircle } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type AccessGrant = {
  id: string;
  recipient_wallet_address: string;
  recipient_name: string | null;
  resource_type: string;
  resource_ids: string[];
  expires_at: string;
  revoked: boolean;
  revoked_at: string | null;
  access_count: number;
  last_accessed_at: string | null;
  created_at: string;
};

export const SharedAccessLog = () => {
  const [grants, setGrants] = useState<AccessGrant[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchGrants();
  }, []);

  const fetchGrants = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await (supabase as any)
      .from("access_grants")
      .select("*")
      .eq("patient_id", user.id)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching grants:", error);
    } else {
      setGrants(data || []);
    }
    setLoading(false);
  };

  const revokeAccess = async (grantId: string) => {
    const { error } = await (supabase as any)
      .from("access_grants")
      .update({
        revoked: true,
        revoked_at: new Date().toISOString(),
      })
      .eq("id", grantId);

    if (error) {
      toast({
        title: "Error",
        description: "Failed to revoke access",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Access Revoked",
        description: "The recipient can no longer access the shared records",
      });
      fetchGrants();
    }
  };

  const getStatusBadge = (grant: AccessGrant) => {
    if (grant.revoked) {
      return <Badge variant="outline" className="border-red-500/50 text-red-500">🔒 Revoked</Badge>;
    }
    
    const isExpired = new Date(grant.expires_at) < new Date();
    if (isExpired) {
      return <Badge variant="outline" className="border-yellow-500/50 text-yellow-500">⏱️ Expired</Badge>;
    }
    
    return <Badge className="bg-green-500/20 text-green-500 border-green-500/50">✅ Active</Badge>;
  };

  if (loading) {
    return (
      <Card className="glass border-2">
        <CardContent className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary/30 border-t-primary mx-auto"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="w-5 h-5 text-primary" />
          Shared Access Log
        </CardTitle>
        <CardDescription>
          Track who you've shared your medical records with
        </CardDescription>
      </CardHeader>
      <CardContent>
        {grants.length === 0 ? (
          <div className="text-center py-8">
            <div className="inline-flex p-4 bg-muted/50 rounded-full mb-4">
              <Share2 className="w-8 h-8 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground">No shared access grants yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {grants.map((grant) => {
              const isActive = !grant.revoked && new Date(grant.expires_at) > new Date();
              
              return (
                <div
                  key={grant.id}
                  className="p-4 rounded-lg border border-border/50 bg-muted/30 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-semibold">
                          {grant.recipient_name || `${grant.recipient_wallet_address.substring(0, 10)}...`}
                        </h4>
                        {getStatusBadge(grant)}
                      </div>
                      <p className="text-sm text-muted-foreground font-mono">
                        {grant.recipient_wallet_address}
                      </p>
                    </div>
                    {isActive && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => revokeAccess(grant.id)}
                        className="text-red-500 hover:text-red-600 hover:bg-red-500/10"
                      >
                        <XCircle className="w-4 h-4 mr-1" />
                        Revoke
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground mb-1">Records Shared</p>
                      <p className="font-medium">{grant.resource_ids.length}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Access Count</p>
                      <p className="font-medium">{grant.access_count}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">Shared</p>
                      <p className="font-medium">
                        {formatDistanceToNow(new Date(grant.created_at), { addSuffix: true })}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground mb-1">
                        {grant.revoked ? "Revoked" : "Expires"}
                      </p>
                      <p className="font-medium">
                        {grant.revoked && grant.revoked_at
                          ? formatDistanceToNow(new Date(grant.revoked_at), { addSuffix: true })
                          : formatDistanceToNow(new Date(grant.expires_at), { addSuffix: true })}
                      </p>
                    </div>
                  </div>

                  {grant.last_accessed_at && (
                    <div className="mt-3 pt-3 border-t border-border/50 flex items-center gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="w-4 h-4" />
                      Last accessed {formatDistanceToNow(new Date(grant.last_accessed_at), { addSuffix: true })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};