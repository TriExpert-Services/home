import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)

export type Database = {
  public: {
    Tables: {
      translation_requests: {
        Row: {
          id: string
          created_at: string
          full_name: string
          phone: string
          email: string
          source_language: string
          target_language: string
          processing_time: string
          desired_format: string
          page_count: number
          document_type: string
          request_date: string
          special_instructions: string | null
          file_urls: string[] | null
          status: string
          total_cost: number | null
        }
        Insert: {
          id?: string
          created_at?: string
          full_name: string
          phone: string
          email: string
          source_language: string
          target_language: string
          processing_time: string
          desired_format: string
          page_count: number
          document_type: string
          request_date: string
          special_instructions?: string | null
          file_urls?: string[] | null
          status?: string
          total_cost?: number | null
        }
        Update: {
          id?: string
          created_at?: string
          full_name?: string
          phone?: string
          email?: string
          source_language?: string
          target_language?: string
          processing_time?: string
          desired_format?: string
          page_count?: number
          document_type?: string
          request_date?: string
          special_instructions?: string | null
          file_urls?: string[] | null
          status?: string
          total_cost?: number | null
        }
      }
    }
  }
}