import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { ControlMode } from '@/types/database';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

// ============================================================================
// GET: Polled by ESP32 or Dashboard to retrieve the latest desired control mode
// ============================================================================
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get('deviceId') || 'CC001';

    const supabase = createAdminClient();

    // Verify device exists
    const { data: device, error: devErr } = await supabase
      .from('devices')
      .select('id, device_id, device_token')
      .eq('device_id', deviceId)
      .maybeSingle();

    if (devErr) {
      console.error('[API /api/fan-control GET] Device lookup error:', devErr);
      return NextResponse.json(
        { error: 'Service Unavailable: Device registry could not be queried' },
        { status: 503 }
      );
    }

    if (!device) {
      return NextResponse.json(
        { error: 'Not Found: Device is not registered' },
        { status: 404 }
      );
    }

    // Token authentication is required for ESP32 hardware polls if header is present
    const token = request.headers.get('X-Device-Token') || request.headers.get('x-device-token');
    if (token) {
      const expectedToken = device?.device_token || process.env.DEFAULT_DEVICE_TOKEN;
      if (expectedToken && token !== expectedToken) {
        return NextResponse.json(
          { error: 'Unauthorized: Invalid device token' },
          { status: 401 }
        );
      }
    }

    // Fetch the most recent command for this device
    const { data: command, error: cmdErr } = await supabase
      .from('device_commands')
      .select('id, mode, created_at, acknowledged_at')
      .eq('device_id', deviceId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (cmdErr) {
      console.error('[API /api/fan-control GET] Error:', cmdErr);
      return NextResponse.json(
        { error: 'Database error fetching control mode' },
        { status: 500 }
      );
    }

    const mode: ControlMode = (command?.mode as ControlMode) || 'AUTO';

    return NextResponse.json({
      mode,
      command_id: command?.id || null,
      device_id: deviceId,
      acknowledged_at: command?.acknowledged_at || null,
    });
  } catch (error: any) {
    console.error('[API /api/fan-control GET] Exception:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error?.message },
      { status: 500 }
    );
  }
}

// ============================================================================
// POST: Invoked by Dashboard to dispatch remote actuator command
// ============================================================================
export async function POST(request: NextRequest) {
  try {
    let body: { deviceId?: string; mode?: ControlMode };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Bad Request: Malformed JSON payload' },
        { status: 400 }
      );
    }

    const { deviceId = 'CC001', mode } = body;

    if (!mode) {
      return NextResponse.json(
        { error: 'Bad Request: mode parameter is required' },
        { status: 400 }
      );
    }

    const validModes: ControlMode[] = ['AUTO', 'FORCE_ON', 'FORCE_OFF'];
    if (!validModes.includes(mode)) {
      return NextResponse.json(
        { error: 'Bad Request: Mode must be AUTO, FORCE_ON, or FORCE_OFF' },
        { status: 422 }
      );
    }

    const supabase = createAdminClient();

    // Verify device exists or create if CC001
    const { data: device, error: deviceErr } = await supabase
      .from('devices')
      .select('id, device_id')
      .eq('device_id', deviceId)
      .maybeSingle();

    if (deviceErr) {
      console.error('[API /api/fan-control POST] Device lookup error:', deviceErr);
      return NextResponse.json(
        { error: 'Service Unavailable: Device registry could not be queried' },
        { status: 503 }
      );
    }

    if (!device) {
      return NextResponse.json(
        { error: 'Not Found: Device is not registered' },
        { status: 404 }
      );
    }

    // Insert new command into device_commands using admin privileges
    const { data: newCmd, error: insertErr } = await supabase
      .from('device_commands')
      .insert({
        device_id: deviceId,
        mode,
        requested_by: null,
      })
      .select()
      .single();

    if (insertErr) {
      console.error('[API /api/fan-control POST] Insert error:', insertErr);
      return NextResponse.json(
        { error: 'Failed to record device command in database' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Command '${mode}' queued for device ${deviceId}. Waiting for ESP32 acknowledgement.`,
      command_id: newCmd.id,
      mode: newCmd.mode,
      created_at: newCmd.created_at,
    });
  } catch (error: any) {
    console.error('[API /api/fan-control POST] Exception:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error?.message },
      { status: 500 }
    );
  }
}
