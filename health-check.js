const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://bhkzvkruimnpbzwpwwgv.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJoa3p2a3J1aW1ucGJ6d3B3d2d2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE1NjIxMTksImV4cCI6MjEwNzEzODExOX0.5NIk-P1P36zQh7TCOIepFAW6ljV2eCbB7tqwkPjnGBA';
const SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJoa3p2a3J1aW1ucGJ6d3B3d2d2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc5MTU2MjExOSwiZXhwIjoyMTA3MTM4MTE5fQ.WF15N-tVgS8onqAG_iOhMb9WhYmMkUhQ8boimuGkTyc';

const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { persistSession: false }
});

const anonClient = createClient(SUPABASE_URL, ANON_KEY);

async function runHealthCheck() {
  console.log('================================================================');
  console.log('🩺 COLDCHAIN MONITOR - PRE-DEPLOYMENT COMPREHENSIVE HEALTH CHECK');
  console.log('================================================================\n');

  let allPassed = true;

  // Test 1: Check Supabase Connection & Tables
  try {
    process.stdout.write('[1/6] Testing Database Tables Connectivity... ');
    const { data: devData, error: devErr } = await adminClient.from('devices').select('count');
    const { data: readData, error: readErr } = await adminClient.from('sensor_readings').select('count');
    const { data: cmdData, error: cmdErr } = await adminClient.from('device_commands').select('count');

    if (devErr || readErr || cmdErr) {
      throw new Error(devErr?.message || readErr?.message || cmdErr?.message);
    }
    console.log('✅ PASSED (devices, sensor_readings, device_commands online)');
  } catch (err) {
    allPassed = false;
    console.log('❌ FAILED:', err.message);
  }

  // Test 2: Check Device CC001 Registration
  try {
    process.stdout.write('[2/6] Checking Device CC001 Registration & Token... ');
    const { data: dev, error: devErr } = await adminClient
      .from('devices')
      .select('*')
      .eq('device_id', 'CC001')
      .single();

    if (devErr || !dev) {
      throw new Error('Device CC001 not found in database');
    }
    console.log(`✅ PASSED (Device ID: ${dev.device_id}, Name: "${dev.name}")`);
  } catch (err) {
    allPassed = false;
    console.log('❌ FAILED:', err.message);
  }

  // Test 3: Check Supabase Auth with Operator Account
  try {
    process.stdout.write('[3/6] Testing Operator Authentication (admin@coldchain.com)... ');
    const { data: authData, error: authErr } = await anonClient.auth.signInWithPassword({
      email: 'admin@coldchain.com',
      password: 'ColdChain@2026!'
    });

    if (authErr || !authData.user) {
      throw new Error(authErr?.message || 'Authentication failed');
    }
    console.log(`✅ PASSED (User UUID: ${authData.user.id})`);
  } catch (err) {
    allPassed = false;
    console.log('❌ FAILED:', err.message);
  }

  // Test 4: Test Local API Sensor Ingestion (POST /api/sensor-data)
  try {
    process.stdout.write('[4/6] Testing Telemetry Ingestion (POST /api/sensor-data)... ');
    const payload = {
      device_id: 'CC001',
      temperature: 6.4,
      humidity: 61.2,
      latitude: 28.6139,
      longitude: 77.2090,
      gps_valid: true,
      fan_status: false,
      control_mode: 'AUTO'
    };

    const res = await fetch('http://localhost:3000/api/sensor-data', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Device-Token': 'coldchain_secret_device_token_2026'
      },
      body: JSON.stringify(payload)
    });

    const resJson = await res.json();
    if (!res.ok || !resJson.success) {
      throw new Error(resJson.error || 'Failed to ingest telemetry');
    }
    console.log(`✅ PASSED (HTTP ${res.status}, ID: ${resJson.reading_id})`);
  } catch (err) {
    allPassed = false;
    console.log('❌ FAILED:', err.message);
  }

  // Test 5: Test Command Polling (GET /api/fan-control?deviceId=CC001)
  try {
    process.stdout.write('[5/6] Testing Command Polling (GET /api/fan-control)... ');
    const res = await fetch('http://localhost:3000/api/fan-control?deviceId=CC001', {
      headers: {
        'X-Device-Token': 'coldchain_secret_device_token_2026'
      }
    });

    const resJson = await res.json();
    if (!res.ok || !resJson.mode) {
      throw new Error(resJson.error || 'Failed to retrieve command mode');
    }
    console.log(`✅ PASSED (Current Mode: "${resJson.mode}")`);
  } catch (err) {
    allPassed = false;
    console.log('❌ FAILED:', err.message);
  }

  // Test 6: Verify Firmware Pinout & API Consistency
  try {
    process.stdout.write('[6/6] Verifying ESP32 Firmware Pinout & Contracts... ');
    const fs = require('fs');
    const firmwareCode = fs.readFileSync('./main.c++', 'utf8');

    const hasDHT = firmwareCode.includes('#define DHTPIN        4');
    const hasSDA = firmwareCode.includes('#define OLED_SDA      21');
    const hasSCL = firmwareCode.includes('#define OLED_SCL      22');
    const hasGPSRX = firmwareCode.includes('#define GPS_RX_PIN    16');
    const hasGPSTX = firmwareCode.includes('#define GPS_TX_PIN    17');
    const hasLED = firmwareCode.includes('#define LED_PIN       25');
    const hasIngest = firmwareCode.includes('/api/sensor-data');
    const hasPoll = firmwareCode.includes('/api/fan-control');

    if (!hasDHT || !hasSDA || !hasSCL || !hasGPSRX || !hasGPSTX || !hasLED || !hasIngest || !hasPoll) {
      throw new Error('Firmware pin configuration or endpoint mismatch');
    }
    console.log('✅ PASSED (Pinout 4, 16, 17, 21, 22, 25 & API paths match)');
  } catch (err) {
    allPassed = false;
    console.log('❌ FAILED:', err.message);
  }

  console.log('\n================================================================');
  if (allPassed) {
    console.log('🎉 ALL 6 HEALTH CHECKS PASSED! Your project is 100% ready for deployment.');
  } else {
    console.log('⚠️ Some checks did not pass. Please review the errors above.');
  }
  console.log('================================================================\n');
}

runHealthCheck().catch(console.error);
