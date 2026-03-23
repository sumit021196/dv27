const token = 'sbp_286089b2f21085260ae67830f90a3c6146e9cef5';
const projectRef = 'bjhuvekaehvyzzptszmq';

const query = `
CREATE TABLE IF NOT EXISTS product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id BIGINT REFERENCES products(id) ON DELETE CASCADE,
    color TEXT,
    size TEXT,
    stock INTEGER DEFAULT 0,
    sku TEXT
);

ALTER TABLE products ADD COLUMN IF NOT EXISTS video_url TEXT;
`;

async function execute() {
  const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query })
  });

  const data = await res.text();
  console.log('Status:', res.status);
  console.log('Response:', data);
}

execute();
export {};
