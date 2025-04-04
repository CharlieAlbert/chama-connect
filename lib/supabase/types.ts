export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      accounts: {
        Row: {
          amount: number
          contribution_month: string
          created_at: string | null
          created_by: string
          id: string
          payment_method: string
          payment_proof: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          contribution_month: string
          created_at?: string | null
          created_by: string
          id?: string
          payment_method: string
          payment_proof?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          contribution_month?: string
          created_at?: string | null
          created_by?: string
          id?: string
          payment_method?: string
          payment_proof?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "accounts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "accounts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      loan_approvals: {
        Row: {
          approval_status: string
          approved_at: string | null
          comment: string | null
          created_at: string | null
          id: string
          loan_id: string
          user_id: string
        }
        Insert: {
          approval_status?: string
          approved_at?: string | null
          comment?: string | null
          created_at?: string | null
          id?: string
          loan_id: string
          user_id: string
        }
        Update: {
          approval_status?: string
          approved_at?: string | null
          comment?: string | null
          created_at?: string | null
          id?: string
          loan_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "loan_approvals_loan_id_fkey"
            columns: ["loan_id"]
            isOneToOne: false
            referencedRelation: "loan_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loan_approvals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      loan_requests: {
        Row: {
          amount: number
          application_date: string
          approved_by: string | null
          created_at: string | null
          id: string
          interest_rate: number | null
          issue_date: string | null
          loan_type: string
          repayment_terms: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          application_date?: string
          approved_by?: string | null
          created_at?: string | null
          id?: string
          interest_rate?: number | null
          issue_date?: string | null
          loan_type: string
          repayment_terms?: string | null
          status: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          application_date?: string
          approved_by?: string | null
          created_at?: string | null
          id?: string
          interest_rate?: number | null
          issue_date?: string | null
          loan_type?: string
          repayment_terms?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "loan_requests_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "loan_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      minutes: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          doc_url: string
          id: string
          meeting_date: string
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          doc_url: string
          id?: string
          meeting_date: string
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          doc_url?: string
          id?: string
          meeting_date?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "minutes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      penalties: {
        Row: {
          account_ref: string | null
          amount: number
          created_at: string | null
          id: string
          loan_ref: string | null
          penalty_type: string
          reason: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_ref?: string | null
          amount: number
          created_at?: string | null
          id?: string
          loan_ref?: string | null
          penalty_type: string
          reason: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_ref?: string | null
          amount?: number
          created_at?: string | null
          id?: string
          loan_ref?: string | null
          penalty_type?: string
          reason?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "penalties_account_ref_fkey"
            columns: ["account_ref"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "penalties_loan_ref_fkey"
            columns: ["loan_ref"]
            isOneToOne: false
            referencedRelation: "loan_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "penalties_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      raffle_cycles: {
        Row: {
          created_at: string | null
          drawing_date: string | null
          drawn_users: Json | null
          eligible_users: Json
          id: string
          is_completed: boolean
          month: number
          updated_at: string | null
          winners_count: number
          year: number
        }
        Insert: {
          created_at?: string | null
          drawing_date?: string | null
          drawn_users?: Json | null
          eligible_users: Json
          id?: string
          is_completed?: boolean
          month: number
          updated_at?: string | null
          winners_count?: number
          year: number
        }
        Update: {
          created_at?: string | null
          drawing_date?: string | null
          drawn_users?: Json | null
          eligible_users?: Json
          id?: string
          is_completed?: boolean
          month?: number
          updated_at?: string | null
          winners_count?: number
          year?: number
        }
        Relationships: []
      }
      raffle_settings: {
        Row: {
          active: boolean
          created_at: string | null
          id: string
          updated_at: string | null
          winners_per_period: number
        }
        Insert: {
          active?: boolean
          created_at?: string | null
          id?: string
          updated_at?: string | null
          winners_per_period?: number
        }
        Update: {
          active?: boolean
          created_at?: string | null
          id?: string
          updated_at?: string | null
          winners_per_period?: number
        }
        Relationships: []
      }
      raffle_winners: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          payment_date: string | null
          payment_status: string
          position: number
          raffle_period: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          payment_date?: string | null
          payment_status?: string
          position: number
          raffle_period: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          payment_date?: string | null
          payment_status?: string
          position?: number
          raffle_period?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "raffle_winners_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          id: string
          last_login: string | null
          name: string
          phone: string
          role: string
          status: string
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          id?: string
          last_login?: string | null
          name: string
          phone: string
          role: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          id?: string
          last_login?: string | null
          name?: string
          phone?: string
          role?: string
          status?: string
          updated_at?: string | null
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
