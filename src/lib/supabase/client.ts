import { createBrowserClient } from '@supabase/ssr';
import { getCleanSupabaseUrl, getCleanAnonKey } from './utils';

export function createClient() {
  return createBrowserClient(
    getCleanSupabaseUrl(),
    getCleanAnonKey()
  );
}
