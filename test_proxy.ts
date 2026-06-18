import { supabase } from './src/lib/supabase';

// Mock window and localStorage
(global as any).window = {} as any;
const storage: Record<string, string> = {};
(global as any).localStorage = {
  getItem: (key: string) => storage[key] || null,
  setItem: (key: string, value: string) => { storage[key] = value; },
  removeItem: (key: string) => { delete storage[key]; },
  clear: () => {}
} as any;

async function run() {
  console.log('Testing proxy...');
  try {
    const fromBuilder = supabase.from('links');
    console.log('fromBuilder exists:', !!fromBuilder);
    const selectBuilder = fromBuilder.select('*');
    console.log('selectBuilder exists:', !!selectBuilder);
  } catch (e: any) {
    console.error('Proxy Error:', e.message || e);
  }
}
run();
