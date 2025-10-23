import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Bell, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type AccessRequest = {
  id: string;
  recipient_wallet_address: string;
  resource_ids: string[];
  expires_at: string;
  created_at: string;
};

export const AccessRequestCard = () => {
  const [pendingRequests, setPendingRequests] = useState<AccessRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingRequests();
    
    // Set up realtime subscription
    const channel = supabase
      .channel('access_grants_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'access_grants'
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
      .from("access_grants")
      .select("*")
      .eq("patient_id", user.id)
      .eq("revoked", false)
      .gt("expires_at", new Date().toISOString())
      .order("created_at", { ascending: false })
      .limit(3);

    if (!error) {
      setPendingRequests(data || []);
    }
    setLoading(false);
  };

  if (loading || pendingRequests.length === 0) {
    return null;
  }

  return (
    <Card className="glass border-2 border-primary/30 animate-fade-in-up">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Bell className="w-5 h-5 text-primary animate-pulse" />
          Active Access Grants
        </CardTitle>
        <CardDescription>
          Records currently shared with healthcare providers
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {pendingRequests.map((request) => (
            <div
              key={request.id}
              className="p-3 rounded-lg border border-primary/20 bg-primary/5"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="font-mono text-sm">
                  {request.recipient_wallet_address.substring(0, 10)}...
                  {request.recipient_wallet_address.substring(request.recipient_wallet_address.length - 8)}
                </div>
                <Badge className="bg-green-500/20 text-green-500 border-green-500/50">
                  Active
                </Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {request.resource_ids.length} records
                </span>
                <span className="text-muted-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Expires {formatDistanceToNow(new Date(request.expires_at), { addSuffix: true })}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};