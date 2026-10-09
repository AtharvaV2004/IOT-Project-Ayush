const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://bhkzvkruimnpbzwpwwgv.supabase.co';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJoa3p2a3J1aW1ucGJ6d3B3d2d2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTU2MjExOSwiZXhwIjoyMTA3MTM4MTE5fQ.WF15N-tVgS8onqAG_iOhMb9WhYmMkUhQ8boimuGkTyc';

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

async function main() {
  console.log('--- 🚀 Starting ColdChain Monitor Automated Setup & Seeding ---');

  // 1. Create or Find Operator User
  const email = 'admin@coldchain.com';
  const password = 'ColdChain@2026!';

  console.log(`[1/4] Ensuring operator account '${email}' exists...`);
  let userId;
  const { data: usersData, error: listErr } = await supabase.auth.admin.listUsers();
  
  const existingUser = usersData?.users?.find(u => u.email === email);
  if (existingUser) {
    userId = existingUser.id;
    console.log(`  -> User found with ID: ${userId}`);
  } else {
    const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (createErr) {
      console.error('  -> Failed to create user:', createErr.message);
      // Fallback to first user in system if any
      if (usersData?.users?.length > 0) {
        userId = usersData.users[0].id;
        console.log(`  -> Using existing user ID: ${userId}`);
      }
    } else {
      userId = newUser.user.id;
      console.log(`  -> Created new user successfully with ID: ${userId}`);
    }
  }

  if (!userId) {
    console.error('[ERROR] Could not obtain a valid user ID.');
    return;
  }

  // 2. Register Device CC001
  console.log('[2/4] Registering Device CC001...');
  const { data: device, error: devErr } = await supabase
    .from('devices')
    .upsert({
      device_id: 'CC001',
      name: 'Cold Storage Unit 01 (ESP32)',
      device_token: 'coldchain_secret_device_token_2026',
      owner_id: userId,
    }, { onConflict: 'device_id' })
    .select()
    .single();

  if (devErr) {
    console.error('  -> Device upsert error:', devErr.message);
  } else {
    console.log(`  -> Device CC001 registered successfully:`, device.id);
  }

  // 3. Initial Default Command
  console.log('[3/4] Initializing default control mode...');
  const { error: cmdErr } = await supabase
    .from('device_commands')
    .insert({
      device_id: 'CC001',
      mode: 'AUTO',
      requested_by: userId,
    });
  if (cmdErr) {
    console.log('  -> Note on command insert:', cmdErr.message);
  } else {
    console.log('  -> Default mode (AUTO) initialized.');
  }

  // 4. Seed 5 initial telemetry samples (simulating ESP32 cold chain run)
  console.log('[4/4] Ingesting initial ESP32 telemetry history...');
  const sampleReadings = [
    {
      device_id: 'CC001',
      temperature: 5.2,
      humidity: 58.4,
      latitude: 28.6139,
      longitude: 77.2090,
      gps_valid: true,
      fan_status: false,
      control_mode: 'AUTO',
      created_at: new Date(Date.now() - 40000).toISOString(),
    },
    {
      device_id: 'CC001',
      temperature: 6.1,
      humidity: 60.1,
      latitude: 28.6142,
      longitude: 77.2095,
      gps_valid: true,
      fan_status: false,
      control_mode: 'AUTO',
      created_at: new Date(Date.now() - 30000).toISOString(),
    },
    {
      device_id: 'CC001',
      temperature: 7.4,
      humidity: 62.0,
      latitude: 28.6148,
      longitude: 77.2102,
      gps_valid: true,
      fan_status: false,
      control_mode: 'AUTO',
      created_at: new Date(Date.now() - 20000).toISOString(),
    },
    {
      device_id: 'CC001',
      temperature: 8.5, // Threshold violation demo
      humidity: 65.3,
      latitude: 28.6155,
      longitude: 77.2110,
      gps_valid: true,
      fan_status: true, // Auto turned ON
      control_mode: 'AUTO',
      created_at: new Date(Date.now() - 10000).toISOString(),
    },
    {
      device_id: 'CC001',
      temperature: 6.8,
      humidity: 61.5,
      latitude: 28.6162,
      longitude: 77.2118,
      gps_valid: true,
      fan_status: false,
      control_mode: 'AUTO',
      created_at: new Date().toISOString(),
    },
  ];

  const { error: seedErr } = await supabase.from('sensor_readings').insert(sampleReadings);
  if (seedErr) {
    console.error('  -> Error inserting readings:', seedErr.message);
  } else {
    console.log('  -> Successfully seeded telemetry readings!');
  }

  console.log('\n======================================================');
  console.log('✅ ALL DONE! Your Cold Chain Monitor is completely ready.');
  console.log('Login Credentials:');
  console.log(`  - Email   : ${email}`);
  console.log(`  - Password: ${password}`);
  console.log('  - Dashboard URL: http://localhost:3000/dashboard');
  console.log('======================================================');
}

main().catch(console.error);
