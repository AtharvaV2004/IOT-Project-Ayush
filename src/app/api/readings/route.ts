import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized: Please log in to access readings' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get('deviceId');
    const limitParam = parseInt(searchParams.get('limit') || '50', 10);
    const limit = Math.min(Math.max(limitParam, 1), 500); // Between 1 and 500 records

    if (!deviceId) {
      return NextResponse.json(
        { error: 'Bad Request: Missing deviceId parameter' },
        { status: 400 }
      );
    }

    // RLS checks whether the user owns or has shared access to the device.
    const { data: device, error: devErr } = await supabase
      .from('devices')
      .select('id, device_id')
      .eq('device_id', deviceId)
      .single();

    if (devErr || !device) {
      return NextResponse.json(
        { error: 'Forbidden: Device not found or access denied' },
        { status: 403 }
      );
    }

    // Fetch readings
    const { data: readings, error: readingsErr } = await supabase
      .from('sensor_readings')
      .select('*')
      .eq('device_id', deviceId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (readingsErr) {
      console.error('[API /api/readings] Error:', readingsErr);
      return NextResponse.json(
        { error: 'Database error fetching readings' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      device_id: deviceId,
      count: readings?.length || 0,
      readings: readings || [],
    });
  } catch (error: any) {
    console.error('[API /api/readings] Exception:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error?.message },
      { status: 500 }
    );
  }
}
