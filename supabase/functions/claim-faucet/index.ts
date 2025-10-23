import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const FAUCET_AMOUNT = 50; // 50 test BDAG tokens
const COOLDOWN_HOURS = 24; // 24 hours cooldown

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user } } = await supabaseClient.auth.getUser();
    
    if (!user) {
      throw new Error('Unauthorized');
    }

    const { wallet_address } = await req.json();

    console.log('Processing faucet claim for user:', user.id);

    // Check for recent claims (within cooldown period)
    const cooldownTime = new Date(Date.now() - COOLDOWN_HOURS * 60 * 60 * 1000).toISOString();
    
    const { data: recentClaim } = await supabaseClient
      .from('faucet_claims')
      .select('claimed_at')
      .eq('user_id', user.id)
      .gte('claimed_at', cooldownTime)
      .order('claimed_at', { ascending: false })
      .limit(1)
      .single();

    if (recentClaim) {
      const nextClaimTime = new Date(new Date(recentClaim.claimed_at).getTime() + COOLDOWN_HOURS * 60 * 60 * 1000);
      const hoursRemaining = Math.ceil((nextClaimTime.getTime() - Date.now()) / (1000 * 60 * 60));
      
      return new Response(
        JSON.stringify({ 
          error: `Please wait ${hoursRemaining} hours before claiming again`,
          nextClaimTime: nextClaimTime.toISOString()
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 429 }
      );
    }

    // Create faucet claim record
    const { error: claimError } = await supabaseClient
      .from('faucet_claims')
      .insert({
        user_id: user.id,
        wallet_address,
        amount: FAUCET_AMOUNT,
      });

    if (claimError) throw claimError;

    // Create purchase record for tracking
    const { error: purchaseError } = await supabaseClient
      .from('bdag_purchases')
      .insert({
        user_id: user.id,
        payment_method: 'faucet',
        bdag_amount: FAUCET_AMOUNT,
        status: 'completed',
        transaction_reference: `FAUCET_${Date.now()}`,
        wallet_address,
      });

    if (purchaseError) throw purchaseError;

    // Update user's BDAG balance
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('bdag_balance')
      .eq('id', user.id)
      .single();

    const newBalance = (profile?.bdag_balance || 0) + FAUCET_AMOUNT;

    const { error: balanceError } = await supabaseClient
      .from('profiles')
      .update({ bdag_balance: newBalance })
      .eq('id', user.id);

    if (balanceError) throw balanceError;

    console.log('Faucet claim successful:', user.id, FAUCET_AMOUNT);

    return new Response(
      JSON.stringify({
        success: true,
        amount: FAUCET_AMOUNT,
        newBalance,
        message: `Successfully claimed ${FAUCET_AMOUNT} test BDAG tokens!`,
        nextClaimTime: new Date(Date.now() + COOLDOWN_HOURS * 60 * 60 * 1000).toISOString()
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing faucet claim:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});