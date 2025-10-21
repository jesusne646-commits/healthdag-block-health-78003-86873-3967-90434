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

    // Get Dutse hospitals for campaigns
    const { data: dutseHospitals } = await supabase
      .from('hospitals')
      .select('id')
      .eq('city', 'Dutse')
      .limit(2);

    // Create demo donation campaigns with Northern Nigerian names
    if (dutseHospitals && dutseHospitals.length > 0) {
      const campaignsData = [
        {
          patient_id: user.id,
          hospital_id: dutseHospitals[0].id,
          title: 'Urgent Heart Surgery for Abubakar',
          description: 'Young father needs critical heart surgery to survive and care for his family',
          illness_category: 'Heart Surgery',
          target_amount: 5000,
          raised_amount: 1250,
          urgency_level: 'critical',
          patient_age: 34,
          patient_story: 'Abubakar is a dedicated father of three who was recently diagnosed with a severe heart condition requiring immediate surgery. As the sole breadwinner of his family, this diagnosis has been devastating both emotionally and financially.',
          status: 'active',
          verified_at: new Date().toISOString(),
          verified_by: user.id,
          end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          patient_id: user.id,
          hospital_id: dutseHospitals[1]?.id || dutseHospitals[0].id,
          title: 'Cancer Treatment for Fatima',
          description: 'Mother of four needs chemotherapy and radiation treatment',
          illness_category: 'Cancer',
          target_amount: 8000,
          raised_amount: 3200,
          urgency_level: 'urgent',
          patient_age: 42,
          patient_story: 'Fatima, a loving mother, was diagnosed with breast cancer last year. Despite her fighting spirit, the cost of treatment has overwhelmed her family. She needs ongoing chemotherapy and radiation therapy.',
          status: 'active',
          verified_at: new Date().toISOString(),
          verified_by: user.id,
          end_date: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          patient_id: user.id,
          hospital_id: hospitals[0].id,
          title: 'Kidney Treatment for Muhammad',
          description: 'Young man requires dialysis and eventual kidney transplant',
          illness_category: 'Kidney Treatment',
          target_amount: 12000,
          raised_amount: 4500,
          urgency_level: 'urgent',
          patient_age: 28,
          patient_story: 'Muhammad is a promising young professional whose life was turned upside down by kidney failure. He requires regular dialysis and is on the waiting list for a transplant.',
          status: 'active',
          verified_at: new Date().toISOString(),
          verified_by: user.id,
          end_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          patient_id: user.id,
          hospital_id: hospitals[1].id,
          title: 'Emergency Surgery for Aisha',
          description: 'Accident victim needs multiple reconstructive surgeries',
          illness_category: 'Accident Recovery',
          target_amount: 6500,
          raised_amount: 5200,
          urgency_level: 'moderate',
          patient_age: 19,
          patient_story: 'Aisha, a university student, was involved in a severe road accident. She survived but needs multiple surgeries to fully recover and return to her studies.',
          status: 'active',
          verified_at: new Date().toISOString(),
          verified_by: user.id,
          end_date: new Date(Date.now() + 40 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          patient_id: user.id,
          hospital_id: hospitals[2].id,
          title: 'Critical Care for Usman',
          description: 'Child needs specialized treatment for rare genetic condition',
          illness_category: 'Other',
          target_amount: 10000,
          raised_amount: 2800,
          urgency_level: 'critical',
          patient_age: 7,
          patient_story: 'Little Usman was born with a rare genetic condition that requires specialized treatment. His parents have exhausted all their resources trying to get him the care he needs.',
          status: 'active',
          verified_at: new Date().toISOString(),
          verified_by: user.id,
          end_date: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
          patient_id: user.id,
          hospital_id: dutseHospitals[0].id,
          title: 'Diabetes Management for Khadija',
          description: 'Long-term diabetes care and insulin therapy needed',
          illness_category: 'Other',
          target_amount: 4000,
          raised_amount: 3500,
          urgency_level: 'moderate',
          patient_age: 51,
          patient_story: 'Khadija has been battling diabetes for years. With proper medication and care, she can lead a normal life, but the ongoing costs are overwhelming for her family.',
          status: 'active',
          verified_at: new Date().toISOString(),
          verified_by: user.id,
          end_date: new Date(Date.now() + 35 * 24 * 60 * 60 * 1000).toISOString()
        }
      ];

      const { error: campaignsError } = await supabase
        .from('donation_campaigns')
        .insert(campaignsData);

      if (campaignsError) {
        console.error('Error creating donation campaigns:', campaignsError);
      }
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

    // Create demo activity logs
    const activityLogsData = [
      {
        user_id: user.id,
        activity_type: 'record',
        title: 'Medical Records Added',
        description: 'Added 5 new medical records to your profile',
        metadata: { count: 5 }
      },
      {
        user_id: user.id,
        activity_type: 'appointment',
        title: 'Appointments Scheduled',
        description: 'Scheduled 2 upcoming appointments',
        metadata: { count: 2 }
      },
      {
        user_id: user.id,
        activity_type: 'payment',
        title: 'Insurance Policy Activated',
        description: 'BlockDAG Health Insurance Premium plan activated',
        metadata: { policy_number: policyData.policy_number }
      }
    ];

    const { error: activityError } = await supabase
      .from('activity_logs')
      .insert(activityLogsData);

    if (activityError) {
      console.error('Error creating activity logs:', activityError);
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
