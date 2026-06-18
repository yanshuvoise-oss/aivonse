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
  console.log('Executing query through proxy...');
  try {
    const { data, error } = await supabase.from('profiles').select('*').limit(1);
    console.log('Result:', data, error);
  } catch (e: any) {
    console.error('Execute Error:', e.stack || e);
  }
}
run();
