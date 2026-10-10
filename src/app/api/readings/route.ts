import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);
    const deviceId = searchParams.get('deviceId') || 'CC001';
    const limitParam = parseInt(searchParams.get('limit') || '50', 10);
    const limit = Math.min(Math.max(limitParam, 1), 500); // Between 1 and 500 records

    // Fetch readings using service role to allow open monitoring
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
