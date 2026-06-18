import { mockSupabase } from './src/lib/supabase';

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
  console.log('Inserting into mock links...');
  try {
    const res = await mockSupabase.from('links').insert({ title: 'test' }).select();
    console.log('Result:', res);
  } catch (e: any) {
    console.error('Mock insert error:', e);
  }
}
run();
