import { defineBoot } from '#q-app/wrappers';
import { createClient } from '@supabase/supabase-js';
import type { Database } from 'src/types/database';

// Supabase configuration
const supabaseUrl = 'https://whmcmvtvfdapimupniru.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndobWNtdnR2ZmRhcGltdXBuaXJ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzIwNzQwMTEsImV4cCI6MjA4NzY1MDAxMX0.IC3cKSK6nWs5mVbgCEX89kQYWnmm-ZHh6o9qplL5vqI';

// Create Supabase client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

export default defineBoot(({ app }) => {
  // Make supabase available in all components
  app.config.globalProperties.$supabase = supabase;
});

// Type declarations
declare module 'vue' {
  interface ComponentCustomProperties {
    $supabase: typeof supabase;
  }
}
