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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      academic_cycles: {
        Row: {
          application_deadline: string | null
          course_id: string
          created_at: string
          id: string
          intake_name: string
          month: number
          updated_at: string
          year: number
        }
        Insert: {
          application_deadline?: string | null
          course_id: string
          created_at?: string
          id?: string
          intake_name: string
          month: number
          updated_at?: string
          year: number
        }
        Update: {
          application_deadline?: string | null
          course_id?: string
          created_at?: string
          id?: string
          intake_name?: string
          month?: number
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "academic_cycles_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          brochure_url: string | null
          course_type: string | null
          created_at: string
          currency: string
          degree_type: string | null
          description: string | null
          domain: string
          duration: string
          id: string
          name: string
          study_level: string
          tuition_fees: number
          university_id: string
          updated_at: string
        }
        Insert: {
          brochure_url?: string | null
          course_type?: string | null
          created_at?: string
          currency?: string
          degree_type?: string | null
          description?: string | null
          domain: string
          duration: string
          id?: string
          name: string
          study_level: string
          tuition_fees: number
          university_id: string
          updated_at?: string
        }
        Update: {
          brochure_url?: string | null
          course_type?: string | null
          created_at?: string
          currency?: string
          degree_type?: string | null
          description?: string | null
          domain?: string
          duration?: string
          id?: string
          name?: string
          study_level?: string
          tuition_fees?: number
          university_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "courses_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      eligibility_rules: {
        Row: {
          backlogs_allowed: number | null
          course_id: string
          created_at: string
          id: string
          min_10th_marks: number | null
          min_12th_marks: number | null
          min_graduation_marks: number | null
          min_ielts: number | null
          min_ielts_bands: number | null
          min_work_experience: number | null
          required_degree: string | null
          updated_at: string
        }
        Insert: {
          backlogs_allowed?: number | null
          course_id: string
          created_at?: string
          id?: string
          min_10th_marks?: number | null
          min_12th_marks?: number | null
          min_graduation_marks?: number | null
          min_ielts?: number | null
          min_ielts_bands?: number | null
          min_work_experience?: number | null
          required_degree?: string | null
          updated_at?: string
        }
        Update: {
          backlogs_allowed?: number | null
          course_id?: string
          created_at?: string
          id?: string
          min_10th_marks?: number | null
          min_12th_marks?: number | null
          min_graduation_marks?: number | null
          min_ielts?: number | null
          min_ielts_bands?: number | null
          min_work_experience?: number | null
          required_degree?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "eligibility_rules_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: true
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_courses: {
        Row: {
          course_id: string
          created_at: string
          eligibility_status: string | null
          id: string
          match_score: number | null
          student_contact_id: string | null
          student_profile_id: string | null
          user_id: string
        }
        Insert: {
          course_id: string
          created_at?: string
          eligibility_status?: string | null
          id?: string
          match_score?: number | null
          student_contact_id?: string | null
          student_profile_id?: string | null
          user_id: string
        }
        Update: {
          course_id?: string
          created_at?: string
          eligibility_status?: string | null
          id?: string
          match_score?: number | null
          student_contact_id?: string | null
          student_profile_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_courses_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_courses_student_contact_id_fkey"
            columns: ["student_contact_id"]
            isOneToOne: false
            referencedRelation: "student_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "saved_courses_student_profile_id_fkey"
            columns: ["student_profile_id"]
            isOneToOne: false
            referencedRelation: "student_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      student_contacts: {
        Row: {
          created_at: string
          dob: string | null
          educational_qualification: string | null
          email: string
          graduated_year: number | null
          id: string
          ielts_score: number | null
          mobile: string
          preferred_countries: string[] | null
          preferred_domains: string[] | null
          student_name: string
          updated_at: string
          user_id: string
          work_experience: number | null
        }
        Insert: {
          created_at?: string
          dob?: string | null
          educational_qualification?: string | null
          email: string
          graduated_year?: number | null
          id?: string
          ielts_score?: number | null
          mobile: string
          preferred_countries?: string[] | null
          preferred_domains?: string[] | null
          student_name: string
          updated_at?: string
          user_id: string
          work_experience?: number | null
        }
        Update: {
          created_at?: string
          dob?: string | null
          educational_qualification?: string | null
          email?: string
          graduated_year?: number | null
          id?: string
          ielts_score?: number | null
          mobile?: string
          preferred_countries?: string[] | null
          preferred_domains?: string[] | null
          student_name?: string
          updated_at?: string
          user_id?: string
          work_experience?: number | null
        }
        Relationships: []
      }
      student_profiles: {
        Row: {
          created_at: string
          graduation_degree: string | null
          graduation_marks: number | null
          id: string
          ielts_score: number | null
          max_tuition_fee: number | null
          preferred_countries: string[] | null
          preferred_course_type: string | null
          preferred_domains: string[] | null
          preferred_duration: string | null
          student_name: string
          study_level: string
          tenth_marks: number | null
          twelfth_english_marks: number | null
          twelfth_marks: number | null
          updated_at: string
          user_id: string
          work_experience: number | null
        }
        Insert: {
          created_at?: string
          graduation_degree?: string | null
          graduation_marks?: number | null
          id?: string
          ielts_score?: number | null
          max_tuition_fee?: number | null
          preferred_countries?: string[] | null
          preferred_course_type?: string | null
          preferred_domains?: string[] | null
          preferred_duration?: string | null
          student_name: string
          study_level: string
          tenth_marks?: number | null
          twelfth_english_marks?: number | null
          twelfth_marks?: number | null
          updated_at?: string
          user_id: string
          work_experience?: number | null
        }
        Update: {
          created_at?: string
          graduation_degree?: string | null
          graduation_marks?: number | null
          id?: string
          ielts_score?: number | null
          max_tuition_fee?: number | null
          preferred_countries?: string[] | null
          preferred_course_type?: string | null
          preferred_domains?: string[] | null
          preferred_duration?: string | null
          student_name?: string
          study_level?: string
          tenth_marks?: number | null
          twelfth_english_marks?: number | null
          twelfth_marks?: number | null
          updated_at?: string
          user_id?: string
          work_experience?: number | null
        }
        Relationships: []
      }
      universities: {
        Row: {
          city: string
          country: string
          created_at: string
          id: string
          name: string
          partner_status: boolean
          ranking: number | null
          updated_at: string
          website: string | null
        }
        Insert: {
          city: string
          country: string
          created_at?: string
          id?: string
          name: string
          partner_status?: boolean
          ranking?: number | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          city?: string
          country?: string
          created_at?: string
          id?: string
          name?: string
          partner_status?: boolean
          ranking?: number | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "counselor"
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
    Enums: {
      app_role: ["admin", "counselor"],
    },
  },
} as const
