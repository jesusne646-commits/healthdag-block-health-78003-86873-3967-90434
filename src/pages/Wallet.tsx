import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Send, ArrowDown, Copy, ExternalLink, Wallet as WalletIcon, Link as LinkIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMetaMask } from "@/hooks/useMetaMask";
import healthdagLogo from "@/assets/healthdag-logo.png";
import Footer from "@/components/Footer";

type Profile = {
  wallet_address: string;
  bdag_balance: number;
};

type Transaction = {
  id: string;
  transaction_type: string;
  amount: number;
  recipient_address: string | null;
  transaction_hash: string | null;
  status: string;
  created_at: string;
};

const Wallet = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [sendAmount, setSendAmount] = useState("");
  const [recipientAddress, setRecipientAddress] = useState("");
  const [receiveAmount, setReceiveAmount] = useState("");
  const [loading, setLoading] = useState(true);
  const [sendLoading, setSendLoading] = useState(false);
  const [receiveLoading, setReceiveLoading] = useState(false);
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [receiveDialogOpen, setReceiveDialogOpen] = useState(false);
  const [walletMode, setWalletMode] = useState<"simulated" | "live">("simulated");
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const {
    account,
    balance,
    isConnected,
    isMetaMaskInstalled,
    isOnBlockDAGNetwork,
    connectWallet,
    disconnectWallet,
    switchToBlockDAG,
    sendTransaction,
    refreshBalance,
  } = useMetaMask();

  const CONTRACT_ADDRESS = "BDAG_CONTRACT_0x1234567890abcdef";
  const BLOCK_EXPLORER = "https://awakening.bdagscan.com";

  useEffect(() => {
    fetchWalletData();
  }, []);

  const fetchWalletData = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      navigate("/auth");
      return;
    }

    const { data: profileData, error: profileError } = await (supabase as any)
      .from("profiles")
      .select("wallet_address, bdag_balance")
      .eq("id", user.id)
      .maybeSingle();

    if (!profileError && profileData) {
      setProfile(profileData);
    }

    const { data: txData, error: txError } = await (supabase as any)
      .from("wallet_transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10);

    if (!txError && txData) {
      setTransactions(txData);
    }

    setLoading(false);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    const amount = parseFloat(sendAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    if (walletMode === "simulated") {
      if (amount > profile.bdag_balance) {
        toast({
          title: "Insufficient Balance",
          description: "You don't have enough BDAG tokens",
          variant: "destructive",
        });
        return;
      }

      setSendLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Update sender balance
      const { error: balanceError } = await (supabase as any)
        .from("profiles")
        .update({
          bdag_balance: profile.bdag_balance - amount,
        })
        .eq("id", user.id);

      // Create transaction record
      const { error: txError } = await (supabase as any).from("wallet_transactions").insert({
        user_id: user.id,
        transaction_type: "send",
        amount: amount,
        recipient_address: recipientAddress,
        transaction_hash: `TX_${Math.random().toString(36).substring(2, 15)}`,
        status: "completed",
      });

      if (balanceError || txError) {
        toast({
          title: "Error",
          description: "Failed to send tokens",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: `Sent ${amount} BDAG to ${recipientAddress.substring(0, 10)}...`,
        });
        setSendDialogOpen(false);
        setSendAmount("");
        setRecipientAddress("");
        fetchWalletData();
      }

      setSendLoading(false);
    } else {
      // Live blockchain transaction via MetaMask
      if (!isConnected) {
        toast({
          title: "Wallet Not Connected",
          description: "Please connect MetaMask first",
          variant: "destructive",
        });
        return;
      }

      if (!isOnBlockDAGNetwork) {
        toast({
          title: "Wrong Network",
          description: "Please switch to BlockDAG Testnet",
          variant: "destructive",
        });
        return;
      }

      setSendLoading(true);
      const txHash = await sendTransaction(recipientAddress, sendAmount);
      
      if (txHash) {
        setSendDialogOpen(false);
        setSendAmount("");
        setRecipientAddress("");
        refreshBalance();
      }
      
      setSendLoading(false);
    }
  };

  const handleReceive = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    const amount = parseFloat(receiveAmount);
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    setReceiveLoading(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    // Update balance
    const { error: balanceError } = await (supabase as any)
      .from("profiles")
      .update({
        bdag_balance: profile.bdag_balance + amount,
      })
      .eq("id", user.id);

    // Create transaction record
    const { error: txError } = await (supabase as any).from("wallet_transactions").insert({
      user_id: user.id,
      transaction_type: "receive",
      amount: amount,
      transaction_hash: `TX_${Math.random().toString(36).substring(2, 15)}`,
      status: "completed",
    });

    if (balanceError || txError) {
      toast({
        title: "Error",
        description: "Failed to receive tokens",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Success",
        description: `Received ${amount} BDAG`,
      });
      setReceiveDialogOpen(false);
      setReceiveAmount("");
      fetchWalletData();
    }

    setReceiveLoading(false);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Address copied to clipboard",
    });
  };

  const openBlockExplorer = (txHash: string) => {
    window.open(`${BLOCK_EXPLORER}/tx/${txHash}`, "_blank");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-secondary/20">
      <header className="border-b border-primary/20 bg-background/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <img src={healthdagLogo} alt="HealthDAG" className="w-8 h-8" />
          <h1 className="text-xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
            My Wallet
          </h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* MetaMask Connection Card */}
        <Card className="mb-6 border-2 border-primary/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <WalletIcon className="w-5 h-5" />
                  Blockchain Wallet
                </CardTitle>
                <CardDescription>Connect MetaMask for real blockchain transactions</CardDescription>
              </div>
              <Tabs value={walletMode} onValueChange={(v) => setWalletMode(v as "simulated" | "live")}>
                <TabsList>
                  <TabsTrigger value="simulated">Simulated</TabsTrigger>
                  <TabsTrigger value="live" disabled={!isConnected}>Live</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {!isMetaMaskInstalled ? (
                <div className="p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-sm font-medium mb-2">MetaMask Not Detected</p>
                  <p className="text-sm text-muted-foreground mb-3">
                    Please install MetaMask browser extension to use blockchain features
                  </p>
                  <Button asChild variant="outline" size="sm">
                    <a href="https://metamask.io/download/" target="_blank" rel="noopener noreferrer">
                      Install MetaMask
                    </a>
                  </Button>
                </div>
              ) : isConnected ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Connected Account</p>
                      <p className="text-sm text-muted-foreground font-mono">
                        {account?.substring(0, 6)}...{account?.substring(38)}
                      </p>
                    </div>
                    <Button variant="outline" size="sm" onClick={disconnectWallet}>
                      Disconnect
                    </Button>
                  </div>
                  
                  <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Network Status</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant={isOnBlockDAGNetwork ? "default" : "destructive"}>
                          {isOnBlockDAGNetwork ? "BlockDAG Testnet" : "Wrong Network"}
                        </Badge>
                      </div>
                    </div>
                    {!isOnBlockDAGNetwork && (
                      <Button variant="outline" size="sm" onClick={switchToBlockDAG}>
                        Switch Network
                      </Button>
                    )}
                  </div>

                  {isOnBlockDAGNetwork && (
                    <div className="p-3 bg-accent/5 border border-accent/20 rounded-lg">
                      <p className="text-sm font-medium mb-1">On-Chain Balance</p>
                      <p className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                        {balance || "0.0000"} BDAG
                      </p>
                      <Button variant="ghost" size="sm" onClick={refreshBalance} className="mt-2">
                        Refresh Balance
                      </Button>
                    </div>
                  )}
                </div>
              ) : (
                <Button onClick={connectWallet} className="w-full">
                  <LinkIcon className="w-4 h-4 mr-2" />
                  Connect MetaMask
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Balance Card */}
        <Card className="mb-6 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl">
                  {walletMode === "simulated" ? "Simulated Balance" : "Live Balance"}
                </CardTitle>
                <CardDescription>
                  {walletMode === "simulated" 
                    ? "Database balance for testing" 
                    : "Real on-chain balance"}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {walletMode === "simulated" 
                ? `${profile?.bdag_balance.toFixed(2)} BDAG`
                : `${balance || "0.0000"} BDAG`
              }
            </div>
            <div className="flex gap-3">
              <Dialog open={sendDialogOpen} onOpenChange={setSendDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex-1" disabled={walletMode === "live" && !isOnBlockDAGNetwork}>
                    <Send className="w-4 h-4 mr-2" />
                    Send
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Send BDAG Tokens</DialogTitle>
                    <DialogDescription>
                      {walletMode === "simulated" 
                        ? "Send simulated BDAG tokens"
                        : "Send real BDAG tokens via MetaMask"}
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSend}>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="recipient">Recipient Address</Label>
                        <Input
                          id="recipient"
                          placeholder={walletMode === "simulated" ? "BDAG_..." : "0x..."}
                          value={recipientAddress}
                          onChange={(e) => setRecipientAddress(e.target.value)}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="send-amount">Amount</Label>
                        <Input
                          id="send-amount"
                          type="number"
                          step="0.01"
                          placeholder="0.00"
                          value={sendAmount}
                          onChange={(e) => setSendAmount(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                    <DialogFooter className="mt-6">
                      <Button type="submit" disabled={sendLoading}>
                        {sendLoading ? "Sending..." : "Send Tokens"}
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>

              {walletMode === "simulated" && (
                <Dialog open={receiveDialogOpen} onOpenChange={setReceiveDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="flex-1">
                      <ArrowDown className="w-4 h-4 mr-2" />
                      Receive
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Receive BDAG Tokens</DialogTitle>
                      <DialogDescription>
                        Simulate receiving BDAG tokens
                      </DialogDescription>
                    </DialogHeader>
                    <form onSubmit={handleReceive}>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="receive-amount">Amount</Label>
                          <Input
                            id="receive-amount"
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={receiveAmount}
                            onChange={(e) => setReceiveAmount(e.target.value)}
                            required
                          />
                        </div>
                      </div>
                      <DialogFooter className="mt-6">
                        <Button type="submit" disabled={receiveLoading}>
                          {receiveLoading ? "Processing..." : "Receive Tokens"}
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Wallet Info */}
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">
                {walletMode === "simulated" ? "Simulated Wallet Address" : "MetaMask Address"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <code className="flex-1 text-sm bg-muted px-3 py-2 rounded truncate">
                  {walletMode === "simulated" ? profile?.wallet_address : (account || "Not connected")}
                </code>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={() => copyToClipboard(
                    walletMode === "simulated" ? (profile?.wallet_address || "") : (account || "")
                  )}
                  disabled={walletMode === "live" && !account}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Block Explorer</CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="w-full" 
                asChild
              >
                <a href={BLOCK_EXPLORER} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View on BDAGScan
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Transaction History */}
        {walletMode === "simulated" && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
              <CardDescription>Your latest simulated BDAG transactions</CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No transactions yet</p>
              ) : (
                <div className="space-y-3">
                  {transactions.map((tx) => (
                    <div
                      key={tx.id}
                      className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          tx.transaction_type === "send" ? "bg-destructive/10" : "bg-primary/10"
                        }`}>
                          {tx.transaction_type === "send" ? (
                            <Send className="w-4 h-4 text-destructive" />
                          ) : (
                            <ArrowDown className="w-4 h-4 text-primary" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium capitalize">{tx.transaction_type}</p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(tx.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-bold ${
                          tx.transaction_type === "send" ? "text-destructive" : "text-primary"
                        }`}>
                          {tx.transaction_type === "send" ? "-" : "+"}{tx.amount.toFixed(2)} BDAG
                        </p>
                        {tx.transaction_hash && (
                          <button
                            onClick={() => copyToClipboard(tx.transaction_hash || "")}
                            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                          >
                            {tx.transaction_hash.substring(0, 12)}...
                            <Copy className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Wallet;
