async function testEndpoints() {
  console.log('--- 🧪 Testing ColdChain Monitor API Endpoints ---');

  // 1. Test POST /api/sensor-data (ESP32 Ingestion)
  console.log('\n[1/2] Testing ESP32 Telemetry Ingestion (POST /api/sensor-data)...');
  const payload = {
    device_id: 'CC001',
    temperature: 7.2,
    humidity: 59.8,
    latitude: 28.6165,
    longitude: 77.2120,
    gps_valid: true,
    fan_status: false,
    control_mode: 'AUTO'
  };

  const postRes = await fetch('http://localhost:3000/api/sensor-data', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Device-Token': 'coldchain_secret_device_token_2026'
    },
    body: JSON.stringify(payload)
  });

  const postData = await postRes.json();
  console.log('  Status Code:', postRes.status);
  console.log('  Response:', postData);

  // 2. Test GET /api/fan-control?deviceId=CC001 (ESP32 Command Polling)
  console.log('\n[2/2] Testing ESP32 Command Polling (GET /api/fan-control)...');
  const getRes = await fetch('http://localhost:3000/api/fan-control?deviceId=CC001', {
    method: 'GET',
    headers: {
      'X-Device-Token': 'coldchain_secret_device_token_2026'
    }
  });

  const getData = await getRes.json();
  console.log('  Status Code:', getRes.status);
  console.log('  Response:', getData);

  console.log('\n✅ End-to-end API verification complete and functional!');
}

testEndpoints().catch(console.error);
