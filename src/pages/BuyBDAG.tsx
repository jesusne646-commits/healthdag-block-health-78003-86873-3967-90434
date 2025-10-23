import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { ArrowLeft, CreditCard, Building2, Smartphone, Loader2, CheckCircle2, Clock } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LanguageToggle } from "@/components/LanguageToggle";
import Footer from "@/components/Footer";

type PaymentMethod = 'card' | 'bank_transfer' | 'mobile_money';

interface Purchase {
  id: string;
  payment_method: string;
  fiat_amount: number;
  fiat_currency: string;
  bdag_amount: number;
  status: string;
  created_at: string;
}

export default function BuyBDAG() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('card');
  const [amount, setAmount] = useState('100');
  const [profile, setProfile] = useState<any>(null);
  const [purchases, setPurchases] = useState<Purchase[]>([]);

  const exchangeRate = 0.05; // 1 USD = 20 BDAG
  const fees = {
    card: 0.035,
    bank_transfer: 0.01,
    mobile_money: 0.02
  };

  const bdagAmount = parseFloat(amount || '0') / exchangeRate;
  const fee = parseFloat(amount || '0') * fees[selectedMethod];
  const total = parseFloat(amount || '0') + fee;

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate('/auth');
        return;
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      const { data: purchasesData } = await supabase
        .from('bdag_purchases')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      setProfile(profileData);
      setPurchases(purchasesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async () => {
    if (!profile?.wallet_address) {
      toast.error('Wallet address not found');
      return;
    }

    if (parseFloat(amount) < 10) {
      toast.error('Minimum purchase amount is $10');
      return;
    }

    setPurchasing(true);

    try {
      const { data, error } = await supabase.functions.invoke('process-bdag-purchase', {
        body: {
          payment_method: selectedMethod,
          fiat_amount: parseFloat(amount),
          fiat_currency: 'USD',
          wallet_address: profile.wallet_address,
          payment_provider: selectedMethod === 'card' ? 'Flutterwave' : 
                           selectedMethod === 'bank_transfer' ? 'Paystack' : 'M-Pesa'
        }
      });

      if (error) throw error;

      toast.success(`Purchase initiated! ${bdagAmount.toFixed(2)} BDAG tokens will be sent to your wallet within 24 hours.`);
      fetchData();
      setAmount('100');
    } catch (error: any) {
      console.error('Purchase error:', error);
      toast.error(error.message || 'Failed to process purchase');
    } finally {
      setPurchasing(false);
    }
  };

  const paymentMethods = [
    {
      id: 'card' as PaymentMethod,
      name: t('buyBdag.method.card'),
      description: t('buyBdag.method.card.desc'),
      icon: CreditCard,
    },
    {
      id: 'bank_transfer' as PaymentMethod,
      name: t('buyBdag.method.bank'),
      description: t('buyBdag.method.bank.desc'),
      icon: Building2,
    },
    {
      id: 'mobile_money' as PaymentMethod,
      name: t('buyBdag.method.mobile'),
      description: t('buyBdag.method.mobile.desc'),
      icon: Smartphone,
    },
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      pending: 'bg-yellow-500/10 text-yellow-500',
      processing: 'bg-blue-500/10 text-blue-500',
      completed: 'bg-green-500/10 text-green-500',
      failed: 'bg-red-500/10 text-red-500',
    };

    return (
      <Badge className={variants[status] || ''}>
        {t(`buyBdag.status.${status}`)}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate('/dashboard')}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {t('buyBdag.title')}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <p className="text-muted-foreground mb-8 text-center">
          {t('buyBdag.subtitle')}
        </p>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Payment Method Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Select Payment Method</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {paymentMethods.map((method) => {
                const Icon = method.icon;
                return (
                  <button
                    key={method.id}
                    onClick={() => setSelectedMethod(method.id)}
                    className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                      selectedMethod === method.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <Icon className="w-5 h-5 mt-1 text-primary" />
                      <div>
                        <div className="font-semibold">{method.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {method.description}
                        </div>
                      </div>
                      {selectedMethod === method.id && (
                        <CheckCircle2 className="w-5 h-5 ml-auto text-primary" />
                      )}
                    </div>
                  </button>
                );
              })}
            </CardContent>
          </Card>

          {/* Purchase Form */}
          <Card>
            <CardHeader>
              <CardTitle>Purchase Details</CardTitle>
              <CardDescription>
                {t('buyBdag.exchangeRate')}: $1 = {(1 / exchangeRate).toFixed(2)} BDAG
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>{t('buyBdag.youPay')} (USD)</Label>
                <Input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="100"
                  min="10"
                />
              </div>

              <div className="space-y-2 p-4 bg-muted rounded-lg">
                <div className="flex justify-between text-sm">
                  <span>{t('buyBdag.youGet')}</span>
                  <span className="font-semibold">{bdagAmount.toFixed(2)} BDAG</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>{t('buyBdag.processingFee')}</span>
                  <span>${fee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold pt-2 border-t">
                  <span>{t('buyBdag.total')}</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>

              <Button
                onClick={handlePurchase}
                disabled={purchasing || !amount || parseFloat(amount) < 10}
                className="w-full"
                size="lg"
              >
                {purchasing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  t('buyBdag.purchase')
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Purchase History */}
        <Card>
          <CardHeader>
            <CardTitle>{t('buyBdag.history')}</CardTitle>
          </CardHeader>
          <CardContent>
            {purchases.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No purchase history yet
              </p>
            ) : (
              <div className="space-y-3">
                {purchases.map((purchase) => (
                  <div
                    key={purchase.id}
                    className="flex items-center justify-between p-4 rounded-lg border"
                  >
                    <div className="flex items-center gap-3">
                      <Clock className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <div className="font-semibold">
                          {purchase.bdag_amount.toFixed(2)} BDAG
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {purchase.fiat_amount
                            ? `$${purchase.fiat_amount} • ${purchase.payment_method}`
                            : purchase.payment_method}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(purchase.status)}
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(purchase.created_at).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
}