import { mockSupabase } from './src/lib/supabase.ts';

// mock localStorage and window
(global as any).window = {} as any;
const storage: Record<string, string> = {};
(global as any).localStorage = {
  getItem: (key: string) => storage[key] || null,
  setItem: (key: string, value: string) => { storage[key] = value; },
  removeItem: (key: string) => { delete storage[key]; },
  clear: () => {}
} as any;

async function run() {
  console.log('Inserting into mock...');
  try {
    const res = await mockSupabase.from('links').insert({ title: 'test' }).select();
    console.log('Result:', res);
  } catch (e) {
    console.error('Error occurred:', e);
  }
}
run();
