import { createClient, SupabaseClient, SupabaseClientOptions } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

const options: SupabaseClientOptions = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  global: {
    headers: {
      'x-application': 'teacher-portal',
    },
  },
}

export const supabase: SupabaseClient = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  options
)

const supabaseServiceKey = import.meta.env.SUPABASE_SERVICE_ROLE_KEY || ''

export const supabaseAdmin: SupabaseClient = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseServiceKey || 'placeholder-key',
  {
    ...options,
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

export const isConfigured = !!supabaseUrl && !!supabaseAnonKey
