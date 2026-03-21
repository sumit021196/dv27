import { NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function GET() {
    try {
        const supabase = await createClient();
        const { data: settings, error } = await supabase
            .from('settings')
            .select('*');

        if (error) throw error;
        
        // Transform to key-value object for easier frontend use
        const settingsMap = settings?.reduce((acc: any, curr: any) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {});

        return NextResponse.json({ settings: settingsMap || {} });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        
        // Ensure admin
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        const { data: profile } = await supabase.from('profiles').select('is_admin').eq('id', user.id).single();
        if (!profile?.is_admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

        const body = await req.json();
        const { key, value } = body;

        const { data, error } = await supabase
            .from('settings')
            .upsert({ key, value, updated_at: new Date() }, { onConflict: 'key' })
            .select()
            .single();

        if (error) throw error;
        return NextResponse.json({ setting: data });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
