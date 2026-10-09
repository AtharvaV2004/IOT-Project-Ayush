import { createClient } from '@supabase/supabase-js';
import { getCleanSupabaseUrl } from './utils';

const DEFAULT_SERVICE_ROLE_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJoa3p2a3J1aW1ucGJ6d3B3d2d2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTU2MjExOSwiZXhwIjoyMTA3MTM4MTE5fQ.WF15N-tVgS8onqAG_iOhMb9WhYmMkUhQ8boimuGkTyc';

export function createAdminClient() {
  const supabaseUrl = getCleanSupabaseUrl();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || DEFAULT_SERVICE_ROLE_KEY;

  return createClient(supabaseUrl, serviceRoleKey.trim(), {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
