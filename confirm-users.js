const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://bhkzvkruimnpbzwpwwgv.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJoa3p2a3J1aW1ucGJ6d3B3d2d2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTU2MjExOSwiZXhwIjoyMTA3MTM4MTE5fQ.WF15N-tVgS8onqAG_iOhMb9WhYmMkUhQ8boimuGkTyc';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

async function autoConfirmAllUsers() {
  console.log('--- 🔓 Auto-confirming All User Accounts in Supabase ---');
  const { data, error } = await supabase.auth.admin.listUsers();

  if (error) {
    console.error('Error listing users:', error.message);
    return;
  }

  for (const user of data.users) {
    const { error: updateErr } = await supabase.auth.admin.updateUserById(user.id, {
      email_confirm: true
    });

    if (updateErr) {
      console.error(`Failed to confirm ${user.email}:`, updateErr.message);
    } else {
      console.log(`✅ Confirmed email for: ${user.email} (UUID: ${user.id})`);
    }
  }

  console.log('--- Done! All accounts are now confirmed and can log in. ---');
}

autoConfirmAllUsers().catch(console.error);
