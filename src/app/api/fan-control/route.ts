import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { ControlMode } from '@/types/database';

export const dynamic = 'force-dynamic';

// ============================================================================
// GET: Polled by ESP32 to retrieve the latest desired control mode
// ============================================================================
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get('deviceId');

    if (!deviceId) {
      return NextResponse.json(
        { error: 'Bad Request: Missing deviceId parameter' },
        { status: 400 }
      );
    }

    // Authenticate Device Token
    const token = request.headers.get('X-Device-Token') || request.headers.get('x-device-token');
    if (!token) {
      return NextResponse.json(
        { error: 'Unauthorized: Missing X-Device-Token header' },
        { status: 401 }
      );
    }

    const supabase = createAdminClient();

    // Verify device exists and token matches
    const { data: device, error: devErr } = await supabase
      .from('devices')
      .select('id, device_id, device_token')
      .eq('device_id', deviceId)
      .single();

    if (devErr || !device) {
      return NextResponse.json(
        { error: 'Device not found' },
        { status: 404 }
      );
    }

    const expectedToken = device.device_token || process.env.DEFAULT_DEVICE_TOKEN;
    if (expectedToken && token !== expectedToken) {
      return NextResponse.json(
        { error: 'Unauthorized: Invalid device token' },
        { status: 401 }
      );
    }

    // Fetch the most recent command for this device
    const { data: command, error: cmdErr } = await supabase
      .from('device_commands')
      .select('id, mode, created_at')
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
// POST: Invoked by Authenticated Dashboard User to send remote command
// ============================================================================
export async function POST(request: NextRequest) {
  try {
    // 1. Verify User Authentication via Session
    const supabaseUserClient = createServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabaseUserClient.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized: You must be logged in to control devices' },
        { status: 401 }
      );
    }

    // 2. Parse and validate request body
    let body: { deviceId?: string; mode?: ControlMode };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Bad Request: Malformed JSON payload' },
        { status: 400 }
      );
    }

    const { deviceId, mode } = body;

    if (!deviceId || !mode) {
      return NextResponse.json(
        { error: 'Bad Request: deviceId and mode are required' },
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

    // 3. RLS verifies that the user owns or has shared access to the device.
    const { data: device, error: deviceErr } = await supabaseUserClient
      .from('devices')
      .select('id, device_id')
      .eq('device_id', deviceId)
      .single();

    if (deviceErr || !device) {
      return NextResponse.json(
        { error: 'Forbidden: You do not own or have permission to control this device' },
        { status: 403 }
      );
    }

    // 4. Insert new command into device_commands
    const { data: newCmd, error: insertErr } = await supabaseUserClient
      .from('device_commands')
      .insert({
        device_id: deviceId,
        mode,
        requested_by: user.id,
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
