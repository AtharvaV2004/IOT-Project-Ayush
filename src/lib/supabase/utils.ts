export const DEFAULT_SUPABASE_URL = 'https://bhkzvkruimnpbzwpwwgv.supabase.co';
export const DEFAULT_SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJoa3p2a3J1aW1ucGJ6d3B3d2d2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE1NjIxMTksImV4cCI6MjEwNzEzODExOX0.5NIk-P1P36zQh7TCOIepFAW6ljV2eCbB7tqwkPjnGBA';

export function getCleanSupabaseUrl(): string {
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL || DEFAULT_SUPABASE_URL;
  url = url.trim();

  // Strip trailing slashes and /rest/v1 or /rest/v1/ suffixes
  url = url.replace(/\/rest\/v1\/?$/i, '');
  url = url.replace(/\/+$/, '');

  return url;
}

export function getCleanAnonKey(): string {
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;
  return key.trim();
}
