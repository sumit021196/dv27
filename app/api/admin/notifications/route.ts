import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

// Helper to verify admin permissions
async function verifyAdmin() {
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    return { error: 'Unauthorized', status: 401, supabase: null };
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single();

  if (profileError || !profile || !profile.is_admin) {
    return { error: 'Forbidden', status: 403, supabase: null };
  }

  // Return the client with admin bypass (using service role via true flag) if we want system operations,
  // but standard client is fine too since profiles checks passed. Let's return admin client for seamless actions.
  const supabaseAdmin = await createClient(true);
  return { error: null, status: 200, supabase: supabaseAdmin };
}

// GET: Fetch recent stock notifications
export async function GET() {
  try {
    const { error, status, supabase } = await verifyAdmin();
    if (error || !supabase) {
      return NextResponse.json({ success: false, error }, { status });
    }

    const { data, error: fetchError } = await supabase
      .from('admin_notifications')
      .select('*')
      .order('read', { ascending: true }) // Unread first
      .order('created_at', { ascending: false }) // Newest first
      .limit(50);

    if (fetchError) {
      return NextResponse.json({ success: false, error: fetchError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, notifications: data });
  } catch (err: any) {
    console.error('[Notifications GET] Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// PUT: Mark notification(s) as read
export async function PUT(req: Request) {
  try {
    const { error, status, supabase } = await verifyAdmin();
    if (error || !supabase) {
      return NextResponse.json({ success: false, error }, { status });
    }

    const body = await req.json();
    const { id, read = true, markAllRead = false } = body;

    if (markAllRead) {
      const { error: updateError } = await supabase
        .from('admin_notifications')
        .update({ read: true })
        .eq('read', false);

      if (updateError) {
        return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: 'All notifications marked as read' });
    }

    if (!id) {
      return NextResponse.json({ success: false, error: 'Notification ID required' }, { status: 400 });
    }

    const { error: updateError } = await supabase
      .from('admin_notifications')
      .update({ read })
      .eq('id', id);

    if (updateError) {
      return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: `Notification ${id} updated` });
  } catch (err: any) {
    console.error('[Notifications PUT] Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

// DELETE: Delete a notification
export async function DELETE(req: Request) {
  try {
    const { error, status, supabase } = await verifyAdmin();
    if (error || !supabase) {
      return NextResponse.json({ success: false, error }, { status });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Notification ID required' }, { status: 400 });
    }

    const { error: deleteError } = await supabase
      .from('admin_notifications')
      .delete()
      .eq('id', id);

    if (deleteError) {
      return NextResponse.json({ success: false, error: deleteError.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: `Notification ${id} deleted` });
  } catch (err: any) {
    console.error('[Notifications DELETE] Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
