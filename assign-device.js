const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://bhkzvkruimnpbzwpwwgv.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJoa3p2a3J1aW1ucGJ6d3B3d2d2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTU2MjExOSwiZXhwIjoyMTA3MTM4MTE5fQ.WF15N-tVgS8onqAG_iOhMb9WhYmMkUhQ8boimuGkTyc';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

async function assignDeviceToUsers() {
  const { data: usersData } = await supabase.auth.admin.listUsers();
  
  // Find vaidyaking143@gmail.com
  const user = usersData?.users?.find(u => u.email === 'vaidyaking143@gmail.com');
  if (user) {
    await supabase
      .from('devices')
      .upsert({
        device_id: 'CC001',
        name: 'Cold Storage Unit 01 (ESP32)',
        device_token: 'coldchain_secret_device_token_2026',
        owner_id: user.id
      }, { onConflict: 'device_id' });
    
    console.log(`✅ Device CC001 assigned to: ${user.email} (ID: ${user.id})`);
  }
}

assignDeviceToUsers().catch(console.error);
