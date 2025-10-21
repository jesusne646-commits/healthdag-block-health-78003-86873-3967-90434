import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useMetaMask } from "@/hooks/useMetaMask";
import { Heart, Wallet, Hospital, Target, Clock, Loader2 } from "lucide-react";

interface DonationModalProps {
  campaign: {
    id: string;
    title: string;
    description: string;
    patient_story: string;
    illness_category: string;
    target_amount: number;
    raised_amount: number;
    urgency_level: string;
    patient_age: number;
    end_date: string | null;
    hospitals: {
      name: string;
    };
    profiles: {
      full_name: string;
      wallet_address: string;
    };
  };
  onClose: () => void;
  onSuccess: () => void;
}

export const DonationModal = ({ campaign, onClose, onSuccess }: DonationModalProps) => {
  const { account, connectWallet, sendTransaction } = useMetaMask();
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [loading, setLoading] = useState(false);

  const progressPercentage = (Number(campaign.raised_amount) / Number(campaign.target_amount)) * 100;
  const remainingAmount = Number(campaign.target_amount) - Number(campaign.raised_amount);

  const predefinedAmounts = [10, 50, 100, 500];

  const handleDonate = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid donation amount",
        variant: "destructive",
      });
      return;
    }

    if (!account) {
      toast({
        title: "Wallet Required",
        description: "Please connect your MetaMask wallet to donate",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      // Send blockchain transaction
      const txHash = await sendTransaction(campaign.profiles.wallet_address, amount);
      
      if (txHash === null || txHash === undefined) {
        throw new Error("Transaction failed");
      }

      // Get current user
      const { data: { user } } = await supabase.auth.getUser();

      // Record donation in database
      const { error } = await supabase.from("donations").insert({
        campaign_id: campaign.id,
        donor_id: isAnonymous ? null : user?.id,
        donor_wallet_address: account,
        recipient_wallet_address: campaign.profiles.wallet_address,
        amount: parseFloat(amount),
        transaction_hash: txHash,
        message: message || null,
        is_anonymous: isAnonymous,
        status: "confirmed", // Assuming instant confirmation for demo
      });

      if (error) throw error;

      toast({
        title: "Donation Successful! 🎉",
        description: `You donated ${amount} BDAG to ${campaign.profiles.full_name?.split(" ")[0] || "this patient"}`,
      });

      onSuccess();
    } catch (error: any) {
      console.error("Donation error:", error);
      toast({
        title: "Donation Failed",
        description: error.message || "Failed to process donation",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Heart className="w-6 h-6 text-rose-500" />
            Support {campaign.profiles.full_name?.split(" ")[0] || "Patient"}
          </DialogTitle>
          <DialogDescription>
            Every BDAG brings them closer to recovery
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Campaign Overview */}
          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-muted rounded-lg">
                <Hospital className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold">{campaign.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {campaign.profiles.full_name}, {campaign.patient_age} years old
                </p>
                <Badge variant="outline" className="mt-2">
                  {campaign.hospitals.name} - Verified
                </Badge>
              </div>
              <Badge className={campaign.urgency_level === "critical" ? "bg-red-500" : ""}>
                {campaign.urgency_level}
              </Badge>
            </div>

            {/* Story */}
            <div className="p-4 bg-muted/50 rounded-lg">
              <h4 className="font-semibold mb-2 text-sm">Patient Story</h4>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {campaign.patient_story || campaign.description}
              </p>
            </div>

            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-2xl font-bold text-primary">
                    {Number(campaign.raised_amount).toFixed(2)} BDAG
                  </div>
                  <div className="text-sm text-muted-foreground">
                    raised of {Number(campaign.target_amount).toFixed(2)} BDAG
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-semibold">{progressPercentage.toFixed(0)}%</div>
                  <div className="text-sm text-muted-foreground">
                    {remainingAmount.toFixed(2)} BDAG to go
                  </div>
                </div>
              </div>
              <Progress value={progressPercentage} className="h-3" />
            </div>
          </div>

          {/* Donation Form */}
          <div className="space-y-4 pt-4 border-t">
            <h4 className="font-semibold flex items-center gap-2">
              <Target className="w-5 h-5" />
              Your Donation
            </h4>

            {/* Quick amounts */}
            <div className="grid grid-cols-4 gap-2">
              {predefinedAmounts.map((amt) => (
                <Button
                  key={amt}
                  type="button"
                  variant={amount === amt.toString() ? "default" : "outline"}
                  onClick={() => setAmount(amt.toString())}
                  className="w-full"
                >
                  {amt} BDAG
                </Button>
              ))}
            </div>

            {/* Custom amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Custom Amount (BDAG)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                min="1"
                step="1"
              />
            </div>

            {/* Optional message */}
            <div className="space-y-2">
              <Label htmlFor="message">Message (Optional)</Label>
              <Textarea
                id="message"
                placeholder="Send words of encouragement..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={500}
              />
            </div>

            {/* Anonymous option */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="anonymous"
                checked={isAnonymous}
                onCheckedChange={(checked) => setIsAnonymous(checked as boolean)}
              />
              <Label htmlFor="anonymous" className="cursor-pointer">
                Donate anonymously
              </Label>
            </div>

            {/* Wallet connection */}
            {!account ? (
              <Button
                onClick={connectWallet}
                className="w-full gap-2"
                variant="outline"
              >
                <Wallet className="w-4 h-4" />
                Connect Wallet to Donate
              </Button>
            ) : (
              <div className="p-3 bg-muted rounded-lg text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Wallet className="w-4 h-4" />
                  <span className="font-mono">{account.slice(0, 6)}...{account.slice(-4)}</span>
                </div>
              </div>
            )}

            {/* Submit */}
            <Button
              onClick={handleDonate}
              disabled={loading || !amount || parseFloat(amount) <= 0}
              className="w-full bg-gradient-to-r from-rose-500 via-pink-500 to-red-500 hover:from-rose-600 hover:via-pink-600 hover:to-red-600 text-white gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Heart className="w-4 h-4" />
                  Donate {amount ? `${amount} BDAG` : "Now"}
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
