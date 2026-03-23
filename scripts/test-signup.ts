import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

dotenv.config({ path: resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSignup() {
  const testEmail = `testuser_${Date.now()}@dv27.in`;
  console.log(`Testing signup for email: ${testEmail}`);

  const { data, error } = await supabase.auth.signUp({
    email: testEmail,
    password: 'securepassword123',
    options: {
      data: {
        full_name: 'Test Setup User'
      }
    }
  });

  if (error) {
    console.error('Signup failed:', error.message);
    return;
  }

  const userId = data?.user?.id;
  console.log('Signup successful! User ID:', userId);

  if (!userId) {
    console.error('No user ID returned. Is email confirmation required?');
    return;
  }

  console.log('Waiting 1 second for database trigger...');
  await new Promise(r => setTimeout(r, 1000));

  console.log('Checking if profile was created in profiles table...');
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (profileError) {
    console.error('Profile trigger might have failed or row missing:', profileError.message);
  } else if (profile) {
    console.log('SUCCESS: Profile row exists!', profile);
  } else {
    console.log('WARNING: Profile row not found.');
  }
}

testSignup();
