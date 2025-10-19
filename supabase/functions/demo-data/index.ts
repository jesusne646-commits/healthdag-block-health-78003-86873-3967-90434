import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get authenticated user
    const authHeader = req.headers.get('Authorization')!;
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabase.auth.getUser(token);

    if (userError || !user) {
      throw new Error('Unauthorized');
    }

    console.log(`Generating demo data for user ${user.id}`);

    // Get existing hospitals
    const { data: hospitals } = await supabase
      .from('hospitals')
      .select('id')
      .limit(3);

    if (!hospitals || hospitals.length === 0) {
      throw new Error('No hospitals found');
    }

    // Create demo appointments
    const appointmentsData = [
      {
        user_id: user.id,
        hospital_id: hospitals[0].id,
        appointment_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        reason: 'Annual physical examination',
        status: 'confirmed'
      },
      {
        user_id: user.id,
        hospital_id: hospitals[1].id,
        appointment_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        reason: 'Follow-up consultation for previous treatment',
        status: 'pending'
      }
    ];

    const { error: appointmentsError } = await supabase
      .from('appointments')
      .insert(appointmentsData);

    if (appointmentsError) {
      console.error('Error creating appointments:', appointmentsError);
    }

    // Create demo medical records
    const recordsData = [
      {
        user_id: user.id,
        hospital_id: hospitals[0].id,
        title: 'Blood Test Results - Annual Checkup',
        record_type: 'lab_result',
        description: 'Complete blood count and lipid panel results from annual physical. Glucose: 95 mg/dL (normal), Cholesterol: 185 mg/dL (normal), HDL: 58 mg/dL (good), LDL: 110 mg/dL (optimal), Triglycerides: 125 mg/dL (normal), Hemoglobin: 14.2 g/dL (normal)'
      },
      {
        user_id: user.id,
        hospital_id: hospitals[1].id,
        title: 'X-Ray Report - Chest',
        record_type: 'imaging',
        description: 'Routine chest X-ray showing no abnormalities. Lungs are clear, no signs of infection or fluid buildup. Heart size normal.'
      },
      {
        user_id: user.id,
        hospital_id: hospitals[2].id,
        title: 'Prescription - Allergy Medication',
        record_type: 'prescription',
        description: 'Prescribed antihistamine (Cetirizine 10mg) for seasonal allergies, take once daily as needed'
      },
      {
        user_id: user.id,
        hospital_id: hospitals[0].id,
        title: 'Physical Examination Report',
        record_type: 'checkup',
        description: 'Annual physical examination completed. Blood pressure: 118/76 mmHg (normal), Heart rate: 72 bpm, Weight: 165 lbs, Height: 5\'8", BMI: 25.1 (slightly overweight). Overall health good, recommended to increase physical activity and monitor weight.'
      },
      {
        user_id: user.id,
        hospital_id: hospitals[1].id,
        title: 'Cardiology Consultation',
        record_type: 'consultation',
        description: 'Follow-up cardiology consultation. ECG normal, no irregularities detected. Blood pressure slightly elevated at 128/82. Advised to reduce sodium intake and exercise 30 minutes daily.'
      }
    ];

    const { error: recordsError } = await supabase
      .from('medical_records')
      .insert(recordsData);

    if (recordsError) {
      console.error('Error creating records:', recordsError);
    }

    // Create demo medical bills
    const billsData = [
      {
        user_id: user.id,
        hospital_id: hospitals[0].id,
        amount: 250.00,
        description: 'Annual Physical Examination',
        category: 'consultation',
        status: 'unpaid'
      },
      {
        user_id: user.id,
        hospital_id: hospitals[1].id,
        amount: 180.00,
        description: 'Blood Test - Complete Panel',
        category: 'lab',
        status: 'unpaid'
      }
    ];

    const { error: billsError } = await supabase
      .from('medical_bills')
      .insert(billsData);

    if (billsError) {
      console.error('Error creating bills:', billsError);
    }

    // Create demo emergency access info
    const { error: emergencyError } = await supabase
      .from('emergency_access')
      .upsert({
        user_id: user.id,
        blood_type: 'O+',
        allergies: ['Penicillin', 'Peanuts'],
        medical_conditions: ['Hypertension', 'Type 2 Diabetes'],
        emergency_contacts: [
          {
            name: 'Jane Doe',
            relationship: 'Spouse',
            phone: '+1-555-0101'
          },
          {
            name: 'John Smith',
            relationship: 'Parent',
            phone: '+1-555-0102'
          }
        ],
        qr_code: `EMERGENCY_${user.id.slice(0, 8)}`
      });

    if (emergencyError) {
      console.error('Error creating emergency data:', emergencyError);
    }

    // Create demo insurance policy
    const policyData = {
      user_id: user.id,
      policy_number: `BDAG-${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      provider: 'BlockDAG Health Insurance',
      plan_type: 'Premium',
      coverage_amount: 500000,
      premium_amount: 450,
      start_date: new Date().toISOString(),
      end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'active',
      coverage_details: {
        hospitalization: '100% coverage',
        outpatient: '80% coverage',
        emergency: '100% coverage',
        prescription: '70% coverage'
      }
    };

    const { error: policyError } = await supabase
      .from('insurance_policies')
      .insert(policyData);

    if (policyError) {
      console.error('Error creating insurance policy:', policyError);
    }

    console.log('Demo data generated successfully');

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'Demo data created successfully'
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in demo-data:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
