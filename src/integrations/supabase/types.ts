export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          activity_type: string
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          title: string
          user_id: string
        }
        Insert: {
          activity_type: string
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          title: string
          user_id: string
        }
        Update: {
          activity_type?: string
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      appointments: {
        Row: {
          appointment_date: string
          created_at: string | null
          hospital_id: string
          id: string
          reason: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          appointment_date: string
          created_at?: string | null
          hospital_id: string
          id?: string
          reason?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          appointment_date?: string
          created_at?: string | null
          hospital_id?: string
          id?: string
          reason?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      donation_campaigns: {
        Row: {
          created_at: string | null
          description: string
          end_date: string | null
          hospital_id: string
          id: string
          illness_category: string
          medical_documents: Json | null
          patient_age: number | null
          patient_id: string
          patient_story: string | null
          raised_amount: number | null
          start_date: string | null
          status: string | null
          target_amount: number
          title: string
          updated_at: string | null
          urgency_level: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          end_date?: string | null
          hospital_id: string
          id?: string
          illness_category: string
          medical_documents?: Json | null
          patient_age?: number | null
          patient_id: string
          patient_story?: string | null
          raised_amount?: number | null
          start_date?: string | null
          status?: string | null
          target_amount: number
          title: string
          updated_at?: string | null
          urgency_level?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          end_date?: string | null
          hospital_id?: string
          id?: string
          illness_category?: string
          medical_documents?: Json | null
          patient_age?: number | null
          patient_id?: string
          patient_story?: string | null
          raised_amount?: number | null
          start_date?: string | null
          status?: string | null
          target_amount?: number
          title?: string
          updated_at?: string | null
          urgency_level?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "donation_campaigns_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      donations: {
        Row: {
          amount: number
          campaign_id: string
          confirmed_at: string | null
          created_at: string | null
          donor_id: string | null
          donor_wallet_address: string
          id: string
          is_anonymous: boolean | null
          message: string | null
          recipient_wallet_address: string
          status: string | null
          transaction_hash: string
        }
        Insert: {
          amount: number
          campaign_id: string
          confirmed_at?: string | null
          created_at?: string | null
          donor_id?: string | null
          donor_wallet_address: string
          id?: string
          is_anonymous?: boolean | null
          message?: string | null
          recipient_wallet_address: string
          status?: string | null
          transaction_hash: string
        }
        Update: {
          amount?: number
          campaign_id?: string
          confirmed_at?: string | null
          created_at?: string | null
          donor_id?: string | null
          donor_wallet_address?: string
          id?: string
          is_anonymous?: boolean | null
          message?: string | null
          recipient_wallet_address?: string
          status?: string | null
          transaction_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "donations_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "donation_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      emergency_access: {
        Row: {
          allergies: string[] | null
          blood_type: string | null
          created_at: string | null
          emergency_contacts: Json | null
          id: string
          medical_conditions: string[] | null
          qr_code: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          allergies?: string[] | null
          blood_type?: string | null
          created_at?: string | null
          emergency_contacts?: Json | null
          id?: string
          medical_conditions?: string[] | null
          qr_code?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          allergies?: string[] | null
          blood_type?: string | null
          created_at?: string | null
          emergency_contacts?: Json | null
          id?: string
          medical_conditions?: string[] | null
          qr_code?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      hospitals: {
        Row: {
          city: string
          created_at: string | null
          id: string
          location: string
          name: string
          rating: number | null
          specialties: string[] | null
        }
        Insert: {
          city: string
          created_at?: string | null
          id?: string
          location: string
          name: string
          rating?: number | null
          specialties?: string[] | null
        }
        Update: {
          city?: string
          created_at?: string | null
          id?: string
          location?: string
          name?: string
          rating?: number | null
          specialties?: string[] | null
        }
        Relationships: []
      }
      insurance_claims: {
        Row: {
          amount: number
          claim_number: string
          claim_type: string
          created_at: string | null
          description: string | null
          hospital_id: string | null
          id: string
          policy_id: string
          processed_at: string | null
          status: string | null
          submitted_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          claim_number: string
          claim_type: string
          created_at?: string | null
          description?: string | null
          hospital_id?: string | null
          id?: string
          policy_id: string
          processed_at?: string | null
          status?: string | null
          submitted_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          claim_number?: string
          claim_type?: string
          created_at?: string | null
          description?: string | null
          hospital_id?: string | null
          id?: string
          policy_id?: string
          processed_at?: string | null
          status?: string | null
          submitted_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "insurance_claims_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "insurance_claims_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "insurance_policies"
            referencedColumns: ["id"]
          },
        ]
      }
      insurance_policies: {
        Row: {
          coverage_amount: number
          coverage_details: Json | null
          created_at: string | null
          end_date: string
          id: string
          plan_type: string
          policy_number: string
          premium_amount: number
          provider: string
          start_date: string
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          coverage_amount: number
          coverage_details?: Json | null
          created_at?: string | null
          end_date: string
          id?: string
          plan_type: string
          policy_number: string
          premium_amount: number
          provider?: string
          start_date?: string
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          coverage_amount?: number
          coverage_details?: Json | null
          created_at?: string | null
          end_date?: string
          id?: string
          plan_type?: string
          policy_number?: string
          premium_amount?: number
          provider?: string
          start_date?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      medical_bills: {
        Row: {
          amount: number
          category: string | null
          created_at: string | null
          description: string | null
          hospital_id: string | null
          id: string
          paid_at: string | null
          status: string | null
          transaction_hash: string | null
          user_id: string
        }
        Insert: {
          amount: number
          category?: string | null
          created_at?: string | null
          description?: string | null
          hospital_id?: string | null
          id?: string
          paid_at?: string | null
          status?: string | null
          transaction_hash?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          category?: string | null
          created_at?: string | null
          description?: string | null
          hospital_id?: string | null
          id?: string
          paid_at?: string | null
          status?: string | null
          transaction_hash?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "medical_bills_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      medical_records: {
        Row: {
          created_at: string | null
          description: string | null
          file_url: string | null
          hospital_id: string | null
          id: string
          record_type: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          file_url?: string | null
          hospital_id?: string | null
          id?: string
          record_type: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          file_url?: string | null
          hospital_id?: string | null
          id?: string
          record_type?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "medical_records_hospital_id_fkey"
            columns: ["hospital_id"]
            isOneToOne: false
            referencedRelation: "hospitals"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          bdag_balance: number | null
          created_at: string | null
          full_name: string | null
          id: string
          updated_at: string | null
          wallet_address: string | null
        }
        Insert: {
          bdag_balance?: number | null
          created_at?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
          wallet_address?: string | null
        }
        Update: {
          bdag_balance?: number | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
          wallet_address?: string | null
        }
        Relationships: []
      }
      wallet_transactions: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          recipient_address: string | null
          status: string | null
          transaction_hash: string | null
          transaction_type: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          recipient_address?: string | null
          status?: string | null
          transaction_hash?: string | null
          transaction_type: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          recipient_address?: string | null
          status?: string | null
          transaction_hash?: string | null
          transaction_type?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
