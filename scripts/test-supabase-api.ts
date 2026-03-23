const token = 'sbp_286089b2f21085260ae67830f90a3c6146e9cef5';
const projectRef = 'bjhuvekaehvyzzptszmq';

async function execute() {
  const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query: 'SELECT current_database();' })
  });

  const data = await res.text();
  console.log('Status:', res.status);
  console.log('Response:', data);
}

execute();
export {};
