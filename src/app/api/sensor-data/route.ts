import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { TelemetryPayload } from '@/types/database';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // 1. Device Token Authentication
    const token = request.headers.get('X-Device-Token') || request.headers.get('x-device-token');
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized: Missing X-Device-Token header' },
        { status: 401 }
      );
    }

    // 2. Parse and validate JSON Payload
    let body: TelemetryPayload;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Bad Request: Malformed JSON payload' },
        { status: 400 }
      );
    }

    const {
      device_id,
      temperature,
      humidity,
      latitude,
      longitude,
      gps_valid = false,
      fan_status = false,
      control_mode = 'AUTO',
    } = body;

    if (!device_id || typeof device_id !== 'string') {
      return NextResponse.json(
        { error: 'Bad Request: Missing or invalid device_id' },
        { status: 400 }
      );
    }

    // Realistic range validations
    if (temperature !== null && temperature !== undefined) {
      const tempNum = Number(temperature);
      if (isNaN(tempNum) || tempNum < -50 || tempNum > 100) {
        return NextResponse.json(
          { error: 'Validation Error: Temperature must be between -50°C and 100°C or null' },
          { status: 422 }
        );
      }
    }

    if (humidity !== null && humidity !== undefined) {
      const humNum = Number(humidity);
      if (isNaN(humNum) || humNum < 0 || humNum > 100) {
        return NextResponse.json(
          { error: 'Validation Error: Humidity must be between 0% and 100% or null' },
          { status: 422 }
        );
      }
    }

    if (latitude !== null && latitude !== undefined) {
      const latNum = Number(latitude);
      if (isNaN(latNum) || latNum < -90 || latNum > 90) {
        return NextResponse.json(
          { error: 'Validation Error: Latitude must be between -90 and 90 or null' },
          { status: 422 }
        );
      }
    }

    if (longitude !== null && longitude !== undefined) {
      const lngNum = Number(longitude);
      if (isNaN(lngNum) || lngNum < -180 || lngNum > 180) {
        return NextResponse.json(
          { error: 'Validation Error: Longitude must be between -180 and 180 or null' },
          { status: 422 }
        );
      }
    }

    const validModes = ['AUTO', 'FORCE_ON', 'FORCE_OFF'];
    if (!validModes.includes(control_mode)) {
      return NextResponse.json(
        { error: 'Validation Error: Invalid control_mode' },
        { status: 422 }
      );
    }

    // 3. Verify Device with Supabase Admin Client
    const supabase = createAdminClient();
    const { data: device, error: deviceErr } = await supabase
      .from('devices')
      .select('id, device_id, device_token')
      .eq('device_id', device_id)
      .single();

    if (deviceErr) {
      console.error('[API /api/sensor-data] Device lookup error:', deviceErr);
      return NextResponse.json(
        { error: 'Service Unavailable: Device registry could not be queried' },
        { status: 503 }
      );
    }

    if (!device) {
      return NextResponse.json(
        { error: 'Forbidden: Device not found or unregistered' },
        { status: 403 }
      );
    }

    // Validate token against device_token (or fallback default token)
    const expectedToken = device.device_token || process.env.DEFAULT_DEVICE_TOKEN;
    if (expectedToken && token !== expectedToken) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid device token for this device' },
        { status: 401 }
      );
    }

    // 4. Insert reading into sensor_readings
    const { data: insertedReading, error: insertErr } = await supabase
      .from('sensor_readings')
      .insert({
        device_id,
        temperature: temperature !== null && temperature !== undefined ? Number(temperature) : null,
        humidity: humidity !== null && humidity !== undefined ? Number(humidity) : null,
        latitude: latitude !== null && latitude !== undefined ? Number(latitude) : null,
        longitude: longitude !== null && longitude !== undefined ? Number(longitude) : null,
        gps_valid: Boolean(gps_valid),
        fan_status: Boolean(fan_status),
        control_mode,
      })
      .select()
      .single();

    if (insertErr) {
      console.error('[API /api/sensor-data] Database Insert Error:', insertErr);
      return NextResponse.json(
        { error: 'Internal Server Error: Failed to insert reading' },
        { status: 500 }
      );
    }

    // 5. Update acknowledged_at on pending command if matching
    const { data: pendingCommands } = await supabase
      .from('device_commands')
      .select('id, mode')
      .eq('device_id', device_id)
      .is('acknowledged_at', null)
      .order('created_at', { ascending: false })
      .limit(1);

    if (pendingCommands && pendingCommands.length > 0) {
      const latestPending = pendingCommands[0];
      if (latestPending.mode === control_mode) {
        await supabase
          .from('device_commands')
          .update({ acknowledged_at: new Date().toISOString() })
          .eq('id', latestPending.id);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Telemetry recorded successfully',
      reading_id: insertedReading?.id,
      timestamp: insertedReading?.created_at,
    });
  } catch (error: any) {
    console.error('[API /api/sensor-data] Unhandled Exception:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error?.message },
      { status: 500 }
    );
  }
}
