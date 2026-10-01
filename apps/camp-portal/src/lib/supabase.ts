import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL?.trim();
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY?.trim();

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl.startsWith('https://') &&
  !supabaseUrl.includes('your-supabase-url') &&
  !supabaseUrl.includes('your-project-ref') &&
  !supabaseUrl.includes('placeholder') &&
  !supabaseUrl.includes('example.com') &&
  !supabaseAnonKey.includes('your-anon-key') &&
  !supabaseAnonKey.includes('placeholder')
);

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://placeholder-domain-relieflink.supabase.co', 'placeholder-anon-key', {
      auth: { persistSession: false },
    });
