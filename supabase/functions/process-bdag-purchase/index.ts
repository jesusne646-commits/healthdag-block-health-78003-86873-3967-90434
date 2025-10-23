import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

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

    const { 
      payment_method, 
      fiat_amount, 
      fiat_currency, 
      wallet_address,
      payment_provider 
    } = await req.json();

    console.log('Processing BDAG purchase:', { payment_method, fiat_amount, fiat_currency, wallet_address });

    // Mock exchange rate (in production, fetch from external API)
    const exchange_rate = 0.05; // 1 USD = 20 BDAG
    const bdag_amount = fiat_amount ? Number(fiat_amount) / exchange_rate : 0;

    // Generate mock transaction reference
    const transaction_reference = `BDAG_${Date.now()}_${Math.random().toString(36).substring(7).toUpperCase()}`;

    // Create purchase record
    const { data: purchase, error: purchaseError } = await supabaseClient
      .from('bdag_purchases')
      .insert({
        user_id: user.id,
        payment_method,
        fiat_amount: fiat_amount || null,
        fiat_currency: fiat_currency || 'USD',
        bdag_amount,
        exchange_rate,
        status: 'processing',
        payment_provider: payment_provider || null,
        transaction_reference,
        wallet_address,
      })
      .select()
      .single();

    if (purchaseError) throw purchaseError;

    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Update purchase status to completed (in production, this would happen via webhook)
    const { error: updateError } = await supabaseClient
      .from('bdag_purchases')
      .update({ status: 'completed' })
      .eq('id', purchase.id);

    if (updateError) throw updateError;

    // Update user's BDAG balance
    const { error: balanceError } = await supabaseClient.rpc('increment_bdag_balance', {
      user_id: user.id,
      amount: bdag_amount
    });

    // If RPC doesn't exist, update directly
    if (balanceError) {
      const { data: profile } = await supabaseClient
        .from('profiles')
        .select('bdag_balance')
        .eq('id', user.id)
        .single();

      const newBalance = (profile?.bdag_balance || 0) + bdag_amount;

      await supabaseClient
        .from('profiles')
        .update({ bdag_balance: newBalance })
        .eq('id', user.id);
    }

    console.log('Purchase completed successfully:', purchase.id);

    return new Response(
      JSON.stringify({
        success: true,
        purchase: {
          ...purchase,
          status: 'completed'
        },
        message: 'Purchase completed successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error processing purchase:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    );
  }
});