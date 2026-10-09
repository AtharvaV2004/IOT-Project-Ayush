import { NextResponse } from 'next/server';
import { createClient as createServerClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const supabase = createServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized: Please log in to access devices' },
        { status: 401 }
      );
    }

    // Fetch all devices owned by user
    const { data: devices, error: devErr } = await supabase
      .from('devices')
      .select('id, device_id, name, created_at')
      .eq('owner_id', user.id)
      .order('created_at', { ascending: true });

    if (devErr) {
      console.error('[API /api/devices] Database error:', devErr);
      return NextResponse.json(
        { error: 'Database error fetching devices' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      devices: devices || [],
    });
  } catch (error: any) {
    console.error('[API /api/devices] Exception:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', details: error?.message },
      { status: 500 }
    );
  }
}
