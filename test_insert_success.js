const { createClient } = require('@supabase/supabase-js');
const client = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const proxyNoBind = new Proxy({}, {
  get(target, prop) {
    if (prop === 'then') return undefined;
    return client[prop];
  }
});

async function run() {
  console.log("Starting proxyNoBind insert success test...");
  try {
    const p1 = proxyNoBind.from('links').insert({ 
      profile_id: 'e1cfdc2f-7f7d-41a4-9e32-23947c5d9a91', // fake valid UUID
      title: 'test success', 
      type: 'link', 
      url: 'https://test.com', 
      sort_order: 1 
    }).select();
    const r1 = await p1;
    console.log("Result:", r1);
  } catch (e) {
    console.error("Error:", e);
  }
}
run();
