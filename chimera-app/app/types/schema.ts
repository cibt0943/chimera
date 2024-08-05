export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          operationName?: string
          query?: string
          variables?: Json
          extensions?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      accounts: {
        Row: {
          created_at: string
          id: string
          language: string
          sub: string
          theme: string
          timezone: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          language?: string
          sub: string
          theme?: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          language?: string
          sub?: string
          theme?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      events: {
        Row: {
          account_id: string
          all_day: boolean
          created_at: string
          end_datetime: string | null
          id: string
          location: string
          memo: string
          start_datetime: string
          title: string
          updated_at: string
        }
        Insert: {
          account_id: string
          all_day?: boolean
          created_at?: string
          end_datetime?: string | null
          id?: string
          location?: string
          memo?: string
          start_datetime: string
          title?: string
          updated_at?: string
        }
        Update: {
          account_id?: string
          all_day?: boolean
          created_at?: string
          end_datetime?: string | null
          id?: string
          location?: string
          memo?: string
          start_datetime?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      memo_settings: {
        Row: {
          account_id: string
          auto_save: boolean
          created_at: string
          id: string
          list_display: Json
          list_filter: Json
          updated_at: string
        }
        Insert: {
          account_id: string
          auto_save?: boolean
          created_at?: string
          id?: string
          list_display?: Json
          list_filter?: Json
          updated_at?: string
        }
        Update: {
          account_id?: string
          auto_save?: boolean
          created_at?: string
          id?: string
          list_display?: Json
          list_filter?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "memo_settings_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: true
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      memos: {
        Row: {
          account_id: string
          content: string
          created_at: string
          id: string
          position: number
          related_date: string | null
          related_date_all_day: boolean
          status: number
          title: string
          updated_at: string
        }
        Insert: {
          account_id: string
          content?: string
          created_at?: string
          id?: string
          position?: number
          related_date?: string | null
          related_date_all_day?: boolean
          status?: number
          title?: string
          updated_at?: string
        }
        Update: {
          account_id?: string
          content?: string
          created_at?: string
          id?: string
          position?: number
          related_date?: string | null
          related_date_all_day?: boolean
          status?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "memos_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          account_id: string
          created_at: string
          due_date: string | null
          due_date_all_day: boolean
          id: string
          memo: string
          position: number
          status: number
          title: string
          updated_at: string
        }
        Insert: {
          account_id: string
          created_at?: string
          due_date?: string | null
          due_date_all_day?: boolean
          id?: string
          memo?: string
          position?: number
          status?: number
          title: string
          updated_at?: string
        }
        Update: {
          account_id?: string
          created_at?: string
          due_date?: string | null
          due_date_all_day?: boolean
          id?: string
          memo?: string
          position?: number
          status?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "accounts"
            referencedColumns: ["id"]
          },
        ]
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
