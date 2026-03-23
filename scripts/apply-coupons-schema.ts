const token = 'sbp_286089b2f21085260ae67830f90a3c6146e9cef5';
const projectRef = 'bjhuvekaehvyzzptszmq';

const query = `
CREATE TABLE IF NOT EXISTS coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    discount_value INTEGER NOT NULL,
    discount_type TEXT NOT NULL,
    min_order_value INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    max_uses_per_user INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS coupon_usages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    coupon_id UUID REFERENCES coupons(id) ON DELETE CASCADE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    used_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
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
