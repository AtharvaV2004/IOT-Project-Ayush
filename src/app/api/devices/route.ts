import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createAdminClient();

    const { data: devices, error: devErr } = await supabase
      .from('devices')
      .select('id, device_id, name, owner_id, created_at')
      .order('created_at', { ascending: true });

    if (devErr) {
      console.error('[API /api/devices] Database error:', devErr);
      return NextResponse.json(
        { error: 'Database error fetching devices' },
        { status: 500 }
      );
    }

    const fallbackDevices = [
      {
        id: 'cc001-id',
        device_id: 'CC001',
        name: 'Cold Storage Unit 01 (ESP32)',
        owner_id: 'station-operator',
        created_at: new Date().toISOString(),
      },
    ];

    return NextResponse.json({
      devices: (devices && devices.length > 0) ? devices : fallbackDevices,
    });
  } catch (error: any) {
    console.error('[API /api/devices] Exception:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error?.message },
      { status: 500 }
    );
  }
}
