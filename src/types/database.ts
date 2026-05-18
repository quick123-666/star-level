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
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          level: number
          lifetime_recognitions: number
          total_xp: number
          updated_at: string
          xp_in_current_level: number
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          level?: number
          lifetime_recognitions?: number
          total_xp?: number
          updated_at?: string
          xp_in_current_level?: number
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          level?: number
          lifetime_recognitions?: number
          total_xp?: number
          updated_at?: string
          xp_in_current_level?: number
        }
        Relationships: []
      }
      github_accounts: {
        Row: {
          created_at: string
          github_avatar_url: string | null
          github_login: string
          github_user_id: number
          id: string
          last_synced_at: string | null
          linked_at: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          github_avatar_url?: string | null
          github_login: string
          github_user_id: number
          id?: string
          last_synced_at?: string | null
          linked_at?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          github_avatar_url?: string | null
          github_login?: string
          github_user_id?: number
          id?: string
          last_synced_at?: string | null
          linked_at?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Functions: {
      my_progress: { Args: Record<string, never>; Returns: Json }
    }
  }
}

export type MyProgress = {
  authenticated: boolean
  level?: number
  xp_in_current_level?: number
  xp_required_for_next_level?: number | null
  total_xp?: number
  lifetime_recognitions?: number
  is_max_level?: boolean
  daily_cap?: number
  business_date?: string
  today_recognized_count?: number
  today_xp_earned?: number
  has_github_linked?: boolean
}
