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
            foreignKeyName: 'events_account_id_fkey'
            columns: ['account_id']
            isOneToOne: false
            referencedRelation: 'accounts'
            referencedColumns: ['id']
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
            foreignKeyName: 'memo_settings_account_id_fkey'
            columns: ['account_id']
            isOneToOne: true
            referencedRelation: 'accounts'
            referencedColumns: ['id']
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
            foreignKeyName: 'memos_account_id_fkey'
            columns: ['account_id']
            isOneToOne: false
            referencedRelation: 'accounts'
            referencedColumns: ['id']
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
            foreignKeyName: 'tasks_account_id_fkey'
            columns: ['account_id']
            isOneToOne: false
            referencedRelation: 'accounts'
            referencedColumns: ['id']
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

type DefaultSchema = Database[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        Database[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      Database[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const
