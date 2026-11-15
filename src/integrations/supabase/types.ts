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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          details: Json
          entity_id: string | null
          entity_type: string
          id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          details?: Json
          entity_id?: string | null
          entity_type: string
          id?: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          details?: Json
          entity_id?: string | null
          entity_type?: string
          id?: string
        }
        Relationships: []
      }
      company_settings: {
        Row: {
          company_name: string
          description: string
          email: string
          id: number
          mission: string
          owner_email: string | null
          phones: string[]
          positioning: string
          region: string
          updated_at: string
          vision: string
        }
        Insert: {
          company_name: string
          description: string
          email: string
          id?: number
          mission: string
          owner_email?: string | null
          phones?: string[]
          positioning: string
          region: string
          updated_at?: string
          vision: string
        }
        Update: {
          company_name?: string
          description?: string
          email?: string
          id?: number
          mission?: string
          owner_email?: string | null
          phones?: string[]
          positioning?: string
          region?: string
          updated_at?: string
          vision?: string
        }
        Relationships: []
      }
      contact_enquiries: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          organization: string | null
          phone: string | null
          subject: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          organization?: string | null
          phone?: string | null
          subject: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          organization?: string | null
          phone?: string | null
          subject?: string
        }
        Relationships: []
      }
      leadership_profiles: {
        Row: {
          bio: string
          created_at: string
          email: string | null
          full_name: string
          id: string
          is_published: boolean
          phone: string | null
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          bio?: string
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          is_published?: boolean
          phone?: string | null
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          bio?: string
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          is_published?: boolean
          phone?: string | null
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      organizations: {
        Row: {
          country: string | null
          created_at: string
          created_by: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          country?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          country?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      partners: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_published: boolean
          logo_url: string | null
          name: string
          partner_type: string
          sort_order: number
          updated_at: string
          website_url: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean
          logo_url?: string | null
          name: string
          partner_type?: string
          sort_order?: number
          updated_at?: string
          website_url?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_published?: boolean
          logo_url?: string | null
          name?: string
          partner_type?: string
          sort_order?: number
          updated_at?: string
          website_url?: string | null
        }
        Relationships: []
      }
      portfolio_projects: {
        Row: {
          completion_status: Database["public"]["Enums"]["portfolio_status"]
          created_at: string
          description: string
          id: string
          image_urls: string[]
          industry: string
          is_published: boolean
          location: string
          published_at: string | null
          service_category: Database["public"]["Enums"]["service_division"]
          slug: string
          technologies: string[]
          title: string
          updated_at: string
        }
        Insert: {
          completion_status?: Database["public"]["Enums"]["portfolio_status"]
          created_at?: string
          description: string
          id?: string
          image_urls?: string[]
          industry: string
          is_published?: boolean
          location: string
          published_at?: string | null
          service_category: Database["public"]["Enums"]["service_division"]
          slug: string
          technologies?: string[]
          title: string
          updated_at?: string
        }
        Update: {
          completion_status?: Database["public"]["Enums"]["portfolio_status"]
          created_at?: string
          description?: string
          id?: string
          image_urls?: string[]
          industry?: string
          is_published?: boolean
          location?: string
          published_at?: string | null
          service_category?: Database["public"]["Enums"]["service_division"]
          slug?: string
          technologies?: string[]
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_type: Database["public"]["Enums"]["account_type"]
          created_at: string
          department: string | null
          email: string
          full_name: string
          id: string
          is_active: boolean
          job_title: string | null
          organization_id: string | null
          phone: string | null
          skills: string[]
          updated_at: string
        }
        Insert: {
          account_type?: Database["public"]["Enums"]["account_type"]
          created_at?: string
          department?: string | null
          email?: string
          full_name?: string
          id: string
          is_active?: boolean
          job_title?: string | null
          organization_id?: string | null
          phone?: string | null
          skills?: string[]
          updated_at?: string
        }
        Update: {
          account_type?: Database["public"]["Enums"]["account_type"]
          created_at?: string
          department?: string | null
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean
          job_title?: string | null
          organization_id?: string | null
          phone?: string | null
          skills?: string[]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      request_attachments: {
        Row: {
          category: string
          created_at: string
          file_name: string
          id: string
          mime_type: string
          request_id: string
          size_bytes: number
          storage_path: string
        }
        Insert: {
          category: string
          created_at?: string
          file_name: string
          id?: string
          mime_type: string
          request_id: string
          size_bytes: number
          storage_path: string
        }
        Update: {
          category?: string
          created_at?: string
          file_name?: string
          id?: string
          mime_type?: string
          request_id?: string
          size_bytes?: number
          storage_path?: string
        }
        Relationships: [
          {
            foreignKeyName: "request_attachments_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "service_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      request_status_events: {
        Row: {
          client_visible: boolean
          created_at: string
          id: string
          note: string | null
          request_id: string
          status: Database["public"]["Enums"]["request_status"]
        }
        Insert: {
          client_visible?: boolean
          created_at?: string
          id?: string
          note?: string | null
          request_id: string
          status: Database["public"]["Enums"]["request_status"]
        }
        Update: {
          client_visible?: boolean
          created_at?: string
          id?: string
          note?: string | null
          request_id?: string
          status?: Database["public"]["Enums"]["request_status"]
        }
        Relationships: [
          {
            foreignKeyName: "request_status_events_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "service_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      service_requests: {
        Row: {
          additional_comments: string | null
          client_type: string
          consent_given_at: string
          contact_name: string
          country: string
          created_at: string
          description: string
          desired_completion_date: string | null
          email: string
          estimated_budget: string | null
          facility_type: string
          id: string
          installation_type: string
          organization_id: string | null
          organization_name: string | null
          phone: string
          preferred_channel: string
          preferred_visit_date: string | null
          priority: string
          project_size: string | null
          project_title: string
          reference: string
          request_type: Database["public"]["Enums"]["request_type"]
          service_category: Database["public"]["Enums"]["service_division"]
          site_address: string | null
          site_city: string
          site_country: string
          site_type: string
          status: Database["public"]["Enums"]["request_status"]
          subcategory: string
          submitted_by: string | null
          tracking_token_hash: string
          updated_at: string
        }
        Insert: {
          additional_comments?: string | null
          client_type: string
          consent_given_at: string
          contact_name: string
          country: string
          created_at?: string
          description: string
          desired_completion_date?: string | null
          email: string
          estimated_budget?: string | null
          facility_type: string
          id?: string
          installation_type: string
          organization_id?: string | null
          organization_name?: string | null
          phone: string
          preferred_channel: string
          preferred_visit_date?: string | null
          priority?: string
          project_size?: string | null
          project_title: string
          reference: string
          request_type: Database["public"]["Enums"]["request_type"]
          service_category: Database["public"]["Enums"]["service_division"]
          site_address?: string | null
          site_city: string
          site_country: string
          site_type: string
          status?: Database["public"]["Enums"]["request_status"]
          subcategory: string
          submitted_by?: string | null
          tracking_token_hash: string
          updated_at?: string
        }
        Update: {
          additional_comments?: string | null
          client_type?: string
          consent_given_at?: string
          contact_name?: string
          country?: string
          created_at?: string
          description?: string
          desired_completion_date?: string | null
          email?: string
          estimated_budget?: string | null
          facility_type?: string
          id?: string
          installation_type?: string
          organization_id?: string | null
          organization_name?: string | null
          phone?: string
          preferred_channel?: string
          preferred_visit_date?: string | null
          priority?: string
          project_size?: string | null
          project_title?: string
          reference?: string
          request_type?: Database["public"]["Enums"]["request_type"]
          service_category?: Database["public"]["Enums"]["service_division"]
          site_address?: string | null
          site_city?: string
          site_country?: string
          site_type?: string
          status?: Database["public"]["Enums"]["request_status"]
          subcategory?: string
          submitted_by?: string | null
          tracking_token_hash?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      bootstrap_owner_account: {
        Args: { _user_id: string }
        Returns: undefined
      }
      current_organization_id: { Args: never; Returns: string }
      has_any_role: {
        Args: {
          _roles: Database["public"]["Enums"]["app_role"][]
          _user_id: string
        }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
      link_guest_requests: { Args: { _user_id: string }; Returns: undefined }
    }
    Enums: {
      account_type: "client" | "staff"
      app_role:
        | "super_admin"
        | "director"
        | "operations_manager"
        | "sales"
        | "project_manager"
        | "engineer"
        | "technician"
        | "finance_officer"
        | "client"
      portfolio_status: "planned" | "in_progress" | "completed"
      request_status:
        | "new"
        | "under_review"
        | "awaiting_information"
        | "assessment_scheduled"
        | "assessment_completed"
        | "quotation_preparation"
        | "quotation_sent"
        | "approved"
        | "rejected"
        | "cancelled"
      request_type: "quotation" | "consultation"
      service_division:
        | "security-systems"
        | "fire-life-safety"
        | "audio-visual"
        | "smart-buildings-ict"
        | "electrical-plumbing"
        | "iptv-signage"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      account_type: ["client", "staff"],
      app_role: [
        "super_admin",
        "director",
        "operations_manager",
        "sales",
        "project_manager",
        "engineer",
        "technician",
        "finance_officer",
        "client",
      ],
      portfolio_status: ["planned", "in_progress", "completed"],
      request_status: [
        "new",
        "under_review",
        "awaiting_information",
        "assessment_scheduled",
        "assessment_completed",
        "quotation_preparation",
        "quotation_sent",
        "approved",
        "rejected",
        "cancelled",
      ],
      request_type: ["quotation", "consultation"],
      service_division: [
        "security-systems",
        "fire-life-safety",
        "audio-visual",
        "smart-buildings-ict",
        "electrical-plumbing",
        "iptv-signage",
      ],
    },
  },
} as const
