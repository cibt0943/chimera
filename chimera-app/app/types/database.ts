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
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
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
          title: string
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
          status: number
          title: string
          todo_id: string
          updated_at: string
        }
        Insert: {
          account_id: string
          created_at?: string
          due_date?: string | null
          due_date_all_day?: boolean
          id?: string
          memo?: string
          status?: number
          title: string
          todo_id: string
          updated_at?: string
        }
        Update: {
          account_id?: string
          created_at?: string
          due_date?: string | null
          due_date_all_day?: boolean
          id?: string
          memo?: string
          status?: number
          title?: string
          todo_id?: string
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
          {
            foreignKeyName: 'tasks_todo_id_fkey'
            columns: ['todo_id']
            isOneToOne: true
            referencedRelation: 'todos'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'tasks_todo_id_fkey'
            columns: ['todo_id']
            isOneToOne: true
            referencedRelation: 'view_todos'
            referencedColumns: ['todo_id']
          },
        ]
      }
      todo_bars: {
        Row: {
          account_id: string
          bg_color: string
          created_at: string
          id: string
          text_color: string
          title: string
          todo_id: string
          updated_at: string
        }
        Insert: {
          account_id: string
          bg_color?: string
          created_at?: string
          id?: string
          text_color?: string
          title: string
          todo_id: string
          updated_at?: string
        }
        Update: {
          account_id?: string
          bg_color?: string
          created_at?: string
          id?: string
          text_color?: string
          title?: string
          todo_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'todo_bars_account_id_fkey'
            columns: ['account_id']
            isOneToOne: false
            referencedRelation: 'accounts'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'todo_bars_todo_id_fkey'
            columns: ['todo_id']
            isOneToOne: true
            referencedRelation: 'todos'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'todo_bars_todo_id_fkey'
            columns: ['todo_id']
            isOneToOne: true
            referencedRelation: 'view_todos'
            referencedColumns: ['todo_id']
          },
        ]
      }
      todos: {
        Row: {
          account_id: string
          created_at: string
          id: string
          position: number
          type: number
          updated_at: string
        }
        Insert: {
          account_id: string
          created_at?: string
          id?: string
          position?: number
          type?: number
          updated_at?: string
        }
        Update: {
          account_id?: string
          created_at?: string
          id?: string
          position?: number
          type?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'todos_account_id_fkey'
            columns: ['account_id']
            isOneToOne: false
            referencedRelation: 'accounts'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      view_todos: {
        Row: {
          account_id: string
          bg_color: string | null
          created_at: string
          due_date: string | null
          due_date_all_day: boolean | null
          memo: string | null
          position: number
          status: number | null
          text_color: string | null
          title: string
          todo_id: string
          type: number | null
          updated_at: string
        }
        Relationships: [
          {
            foreignKeyName: 'todos_account_id_fkey'
            columns: ['account_id']
            isOneToOne: false
            referencedRelation: 'accounts'
            referencedColumns: ['id']
          },
        ]
      }
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

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
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
