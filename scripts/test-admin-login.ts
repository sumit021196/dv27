import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

async function testAdminLogin() {
  console.log('Testing login for admin@dv27.in...');
  const { data, error } = await supabase.auth.signInWithPassword({
    email: 'admin@dv27.in',
    password: '123456'
  });

  if (error) {
    console.error('Login failed:', error.message);
    return;
  }

  console.log('Login successful! User ID:', data.user.id);

  console.log('Ensuring user is admin in DB...');
  await supabaseAdmin.from('profiles').update({ is_admin: true }).eq('id', data.user.id);

  console.log('Fetching role from profiles table...');
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', data.user.id)
    .single();

  if (profileError) {
    console.error('Failed to fetch profile:', profileError.message);
  } else {
    console.log('User is_admin:', profile?.is_admin);
    if (profile?.is_admin === true) {
      console.log('SUCCESS: User has correct admin role!');
    } else {
      console.log('WARNING: User does NOT have admin role.');
    }
  }
}

testAdminLogin();
