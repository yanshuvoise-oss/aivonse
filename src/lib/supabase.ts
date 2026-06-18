import { createClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';

// Environment variables
const rawSupabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseUrl = rawSupabaseUrl.replace(/\/rest\/v1\/?$/, '');
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const DEV_MODE_DISABLE_AUTH = process.env.NEXT_PUBLIC_DEV_MODE_DISABLE_AUTH === 'true';

// Detect if we have valid-looking Supabase credentials AND dev mode is off
export const isRealSupabase = 
  !DEV_MODE_DISABLE_AUTH &&
  supabaseUrl && 
  supabaseAnonKey && 
  !supabaseUrl.includes('placeholder') && 
  !supabaseAnonKey.includes('placeholder');

// Real Supabase Client (cookie aware) — lazy-initialized to avoid crashes during SSR/prerender
let _realSupabase: ReturnType<typeof createBrowserClient> | null = null;
function getRealSupabase() {
  if (!isRealSupabase) return null;
  if (!_realSupabase) {
    _realSupabase = createBrowserClient(supabaseUrl, supabaseAnonKey);
  }
  return _realSupabase;
}
export { getRealSupabase as realSupabaseGetter };
export const realSupabase = isRealSupabase && typeof window !== 'undefined'
  ? createBrowserClient(supabaseUrl, supabaseAnonKey)
  : null;

// Helpers to sync cookie state for Next.js Middleware
const setSessionCookie = (isAdmin: boolean) => {
  if (typeof document !== 'undefined') {
    document.cookie = `aivones_session_active=true; path=/; max-age=86400; SameSite=Lax`;
    if (isAdmin) {
      document.cookie = `aivones_admin_active=true; path=/; max-age=86400; SameSite=Lax`;
    } else {
      document.cookie = `aivones_admin_active=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax`;
    }
  }
};

const clearSessionCookies = () => {
  if (typeof document !== 'undefined') {
    document.cookie = `aivones_session_active=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax`;
    document.cookie = `aivones_admin_active=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax`;
  }
};

// ==========================================
// MOCK SUPABASE FALLBACK ENGINE (Client-Side)
// ==========================================
class MockSupabaseClient {
  private listeners: Array<(event: string, session: any) => void> = [];

  constructor() {
    if (typeof window !== 'undefined') {
      this.seedMockDatabase();
    }
  }

  private seedMockDatabase() {
    if (!localStorage.getItem('aivones_users')) {
      const mockUsers = [
        {
          id: 'admin-uuid-1234',
          email: 'admin@aivones.com',
          password: 'password123',
          raw_user_meta_data: { full_name: 'Aivones Admin', username: 'admin', is_admin: true }
        }
      ];
      localStorage.setItem('aivones_users', JSON.stringify(mockUsers));
    }

    if (!localStorage.getItem('aivones_profiles')) {
      const mockProfiles = [
        {
          id: 'admin-uuid-1234',
          username: 'admin',
          full_name: 'Aivones Admin',
          bio: 'Welcome to the Aivones platform admin profile page!',
          avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&h=256&q=80',
          social_links: { twitter: 'aivones', github: 'aivones', website: 'aivones.com' },
          theme_config: { bg_type: 'gradient', bg_value: 'from-purple-950 via-zinc-950 to-black', link_style: 'glass', text_color: 'text-zinc-100' },
          is_admin: true,
          created_at: new Date().toISOString()
        }
      ];
      localStorage.setItem('aivones_profiles', JSON.stringify(mockProfiles));
    }

    if (!localStorage.getItem('aivones_links')) {
      const mockLinks: any[] = [];
      localStorage.setItem('aivones_links', JSON.stringify(mockLinks));
    }

    if (!localStorage.getItem('aivones_subscriptions')) {
      const mockSubs = [
        {
          id: 'sub-1',
          profile_id: 'admin-uuid-1234',
          stripe_subscription_id: 'sub_admin_pro',
          status: 'active',
          plan_type: 'pro',
          created_at: new Date().toISOString()
        }
      ];
      localStorage.setItem('aivones_subscriptions', JSON.stringify(mockSubs));
    }

    if (!localStorage.getItem('aivones_coupons')) {
      const mockCoupons = [
        { id: 'c-1', code: 'WELCOME50', discount_percent: 50, is_active: true, uses: 0, created_at: new Date().toISOString() },
        { id: 'c-2', code: 'FREEPRO', discount_percent: 100, is_active: true, uses: 0, created_at: new Date().toISOString() },
        { id: 'c-3', code: 'AIVONES10', discount_percent: 10, is_active: true, uses: 0, created_at: new Date().toISOString() }
      ];
      localStorage.setItem('aivones_coupons', JSON.stringify(mockCoupons));
    }

    if (!localStorage.getItem('aivones_analytics')) {
      const mockAnalytics: any[] = [];
      localStorage.setItem('aivones_analytics', JSON.stringify(mockAnalytics));
    }

    if (!localStorage.getItem('aivones_smart_links')) {
      localStorage.setItem('aivones_smart_links', JSON.stringify([]));
    }
  }

  private getSessionUser() {
    if (typeof window === 'undefined') return null;
    const session = localStorage.getItem('aivones_session');
    if (!session) return null;
    try {
      return JSON.parse(session);
    } catch {
      return null;
    }
  }

  auth = {
    signUp: async ({ email, password, options }: any) => {
      const users = JSON.parse(localStorage.getItem('aivones_users') || '[]');
      if (users.find((u: any) => u.email.toLowerCase() === email.toLowerCase())) {
        return { data: { user: null }, error: { message: 'User already exists' } };
      }

      const id = 'user-uuid-' + Math.random().toString(36).substr(2, 9);
      const username = options?.data?.username || email.split('@')[0] + '_' + Math.floor(1000 + Math.random() * 9000);
      const full_name = options?.data?.full_name || email.split('@')[0];

      const newUser = {
        id,
        email,
        password,
        raw_user_meta_data: { full_name, username, is_admin: false }
      };

      users.push(newUser);
      localStorage.setItem('aivones_users', JSON.stringify(users));

      // Trigger profile creation
      const profiles = JSON.parse(localStorage.getItem('aivones_profiles') || '[]');
      const newProfile = {
        id,
        username,
        full_name,
        bio: 'Welcome to my new link page!',
        avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=256&h=256&q=80',
        social_links: {},
        theme_config: { bg_type: 'gradient', bg_value: 'from-zinc-950 to-black', link_style: 'glass', text_color: 'text-zinc-100' },
        is_admin: false,
        created_at: new Date().toISOString()
      };
      profiles.push(newProfile);
      localStorage.setItem('aivones_profiles', JSON.stringify(profiles));

      // Trigger subscription creation
      const subs = JSON.parse(localStorage.getItem('aivones_subscriptions') || '[]');
      subs.push({
        id: 'sub-' + Math.random().toString(36).substr(2, 9),
        profile_id: id,
        stripe_subscription_id: null,
        status: 'active',
        plan_type: 'free',
        created_at: new Date().toISOString()
      });
      localStorage.setItem('aivones_subscriptions', JSON.stringify(subs));

      const session = { user: { id, email, user_metadata: newUser.raw_user_meta_data } };
      localStorage.setItem('aivones_session', JSON.stringify(session));

      // Sync cookies for middleware
      setSessionCookie(false);
      if (typeof document !== 'undefined') {
        document.cookie = `aivones_test_mode_logged_out=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax`;
      }

      this.listeners.forEach((listener) => listener('SIGNED_IN', session));

      return { data: session, error: null };
    },

    signInWithPassword: async ({ email, password }: any) => {
      const users = JSON.parse(localStorage.getItem('aivones_users') || '[]');
      const user = users.find(
        (u: any) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
      );

      if (!user) {
        return { data: { user: null }, error: { message: 'Invalid login credentials' } };
      }

      const session = { user: { id: user.id, email: user.email, user_metadata: user.raw_user_meta_data } };
      localStorage.setItem('aivones_session', JSON.stringify(session));

      // Sync cookies for middleware (check if admin)
      const isAdmin = !!user.raw_user_meta_data?.is_admin;
      setSessionCookie(isAdmin);
      if (typeof document !== 'undefined') {
        document.cookie = `aivones_test_mode_logged_out=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax`;
      }

      this.listeners.forEach((listener) => listener('SIGNED_IN', session));

      return { data: session, error: null };
    },

    signOut: async () => {
      localStorage.removeItem('aivones_session');
      clearSessionCookies();
      if (typeof document !== 'undefined') {
        document.cookie = `aivones_test_mode_logged_out=true; path=/; max-age=86400; SameSite=Lax`;
      }
      this.listeners.forEach((listener) => listener('SIGNED_OUT', null));
      return { error: null };
    },

    getSession: async () => {
      let session = this.getSessionUser();
      const isLoggedOut = typeof document !== 'undefined' && document.cookie.includes('aivones_test_mode_logged_out=true');
      if (!session && DEV_MODE_DISABLE_AUTH && !isLoggedOut) {
        // Automatically inject admin session if auth is disabled in dev mode
        const users = JSON.parse(localStorage.getItem('aivones_users') || '[]');
        const adminUser = users.find((u: any) => u.email === 'admin@aivones.com');
        if (adminUser) {
           session = { user: { id: adminUser.id, email: adminUser.email, user_metadata: adminUser.raw_user_meta_data } };
           localStorage.setItem('aivones_session', JSON.stringify(session));
           setSessionCookie(true);
        }
      }
      return { data: { session }, error: null };
    },

    getUser: async () => {
      let session = this.getSessionUser();
      const isLoggedOut = typeof document !== 'undefined' && document.cookie.includes('aivones_test_mode_logged_out=true');
      if (!session && DEV_MODE_DISABLE_AUTH && !isLoggedOut) {
        const users = JSON.parse(localStorage.getItem('aivones_users') || '[]');
        const adminUser = users.find((u: any) => u.email === 'admin@aivones.com');
        if (adminUser) {
           session = { user: { id: adminUser.id, email: adminUser.email, user_metadata: adminUser.raw_user_meta_data } };
           localStorage.setItem('aivones_session', JSON.stringify(session));
           setSessionCookie(true);
        }
      }
      return { data: { user: session ? session.user : null }, error: null };
    },

    onAuthStateChange: (callback: (event: string, session: any) => void) => {
      this.listeners.push(callback);
      const session = this.getSessionUser();
      if (session) {
        // Also ensure cookies are set when app loads and session exists
        const isAdmin = !!session.user?.user_metadata?.is_admin;
        setSessionCookie(isAdmin);
        callback('SIGNED_IN', session);
      } else {
        clearSessionCookies();
      }
      return {
        data: {
          subscription: {
            unsubscribe: () => {
              this.listeners = this.listeners.filter((l) => l !== callback);
            }
          }
        }
      };
    }
  };

  from(table: string) {
    const getItems = (): any[] => {
      if (typeof window === 'undefined') return [];
      return JSON.parse(localStorage.getItem(`aivones_${table}`) || '[]');
    };

    const setItems = (items: any[]) => {
      if (typeof window === 'undefined') return;
      localStorage.setItem(`aivones_${table}`, JSON.stringify(items));
    };

    let queryItems = getItems();

    const queryBuilder = {
      select: (columns: string = '*', options?: any) => {
        // If head:true is requested (count queries), mark for count-only response
        return queryBuilder;
      },
      eq: (column: string, value: any) => {
        queryItems = queryItems.filter((item) => item[column] === value);
        return queryBuilder;
      },
      order: (column: string, { ascending = true }: any = {}) => {
        queryItems.sort((a, b) => {
          if (a[column] < b[column]) return ascending ? -1 : 1;
          if (a[column] > b[column]) return ascending ? 1 : -1;
          return 0;
        });
        return queryBuilder;
      },
      limit: (count: number) => {
        queryItems = queryItems.slice(0, count);
        return queryBuilder;
      },
      single: async () => {
        return { data: queryItems[0] || null, error: null };
      },
      insert: (data: any) => {
        const items = getItems();
        const records = Array.isArray(data) ? data : [data];
        const inserted: any[] = [];
        
        for (const record of records) {
          const newRecord = {
            id: record.id || 'id-' + Math.random().toString(36).substr(2, 9),
            created_at: new Date().toISOString(),
            ...record
          };
          items.push(newRecord);
          inserted.push(newRecord);
        }

        setItems(items);

        const result = { data: Array.isArray(data) ? inserted : inserted[0], error: null };
        return {
          ...result,
          select: () => ({
            ...result,
            single: async () => result
          }),
          then: (onfulfilled: any) => { onfulfilled(result); }
        };
      },
      update: (data: any) => {
        // Deferred update: collect .eq() filters, execute on await/then
        const updateFilters: Array<{ column: string; value: any }> = [];

        const doUpdate = () => {
          const items = getItems();
          let filtered = items;
          for (const f of updateFilters) {
            filtered = filtered.filter((item) => item[f.column] === f.value);
          }
          // Also apply any filters from the main queryItems chain
          const matchIds = new Set([
            ...filtered.map((i) => i.id),
            ...queryItems.map((i) => i.id)
          ]);
          // Use intersection: item must match both queryItems AND updateFilters
          const finalMatch = updateFilters.length > 0 && queryItems.length === getItems().length
            ? filtered
            : queryItems.length < getItems().length && updateFilters.length === 0
              ? queryItems
              : filtered;

          let affectedCount = 0;
          const updatedItems = items.map((item) => {
            const isMatch = finalMatch.some((qi: any) => qi.id === item.id);
            if (isMatch) {
              affectedCount++;
              return { ...item, ...data, updated_at: new Date().toISOString() };
            }
            return item;
          });
          setItems(updatedItems);
          return { data: null, error: null, count: affectedCount };
        };

        const updateBuilder: any = {
          eq: (column: string, value: any) => {
            updateFilters.push({ column, value });
            return updateBuilder;
          },
          then: (onfulfilled: any) => {
            onfulfilled(doUpdate());
          }
        };

        return updateBuilder;
      },
      delete: () => {
        // Deferred delete: supports .eq() chaining after .delete()
        const deleteFilters: Array<{ column: string; value: any }> = [];

        const doDelete = () => {
          const items = getItems();
          let filtered = items;
          for (const f of deleteFilters) {
            filtered = filtered.filter((item) => item[f.column] === f.value);
          }
          const toDelete = deleteFilters.length > 0 ? filtered : queryItems;
          const remaining = items.filter((item) => !toDelete.some((qi: any) => qi.id === item.id));
          setItems(remaining);
          return { data: null, error: null };
        };

        const deleteBuilder: any = {
          eq: (column: string, value: any) => {
            deleteFilters.push({ column, value });
            return deleteBuilder;
          },
          then: (onfulfilled: any) => {
            onfulfilled(doDelete());
          }
        };

        return deleteBuilder;
      },
      then: (onfulfilled: any, onrejected?: any) => {
        try {
          return Promise.resolve(onfulfilled({ data: queryItems, error: null, count: queryItems.length }));
        } catch(e) {
          return onrejected ? Promise.resolve(onrejected(e)) : Promise.reject(e);
        }
      }
    };

    return queryBuilder;
  }

  storage = {
    from: (bucketName: string) => {
      return {
        upload: async (path: string, file: File) => {
          try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('path', `${bucketName}/${path}`);
            
            const res = await fetch('/api/mock-storage', {
              method: 'POST',
              body: formData
            });
            
            if (!res.ok) {
              throw new Error('Upload failed');
            }
            
            const fullPath = `${bucketName}/${path}`;
            return {
              data: { path, publicUrl: `/api/mock-storage?path=${encodeURIComponent(fullPath)}` },
              error: null
            };
          } catch (e) {
            return {
              data: null,
              error: { message: "Failed to upload file" }
            };
          }
        },
        getPublicUrl: (path: string) => {
          const fullPath = `${bucketName}/${path}`;
          return { data: { publicUrl: `/api/mock-storage?path=${encodeURIComponent(fullPath)}` } };
        }
      };
    }
  };
}

export const mockSupabase = new MockSupabaseClient() as any;

// Build the exported supabase client.
// IMPORTANT: We do NOT wrap the real client in a global Proxy — doing so breaks
// PostgREST builder awaiting (insert/select/update/delete hang forever because
// the Proxy intercepts the implicit .then() checks on builder objects).
// Instead we create the real client directly and only patch storage.from()
// to route uploads through our server-side proxy API that bypasses RLS.

function createSafeClient(): any {
  if (!isRealSupabase) return mockSupabase;

  const client = getRealSupabase();
  if (!client) return mockSupabase;

  // Patch storage.from to proxy uploads through our API route
  const originalStorageFrom = client.storage.from.bind(client.storage);

  client.storage.from = (bucketName: string) => {
    const bucket = originalStorageFrom(bucketName);
    const originalUpload = bucket.upload.bind(bucket);

    // Override upload to go through our server-side proxy
    bucket.upload = async (path: string, file: File, options?: any) => {
      try {
        const { data: sessionData } = await client.auth.getSession();
        const token = sessionData.session?.access_token;

        const formData = new FormData();
        formData.append('file', file);
        formData.append('path', path);
        formData.append('bucket', bucketName);

        const res = await fetch('/api/storage/upload', {
          method: 'POST',
          headers: token ? { 'Authorization': `Bearer ${token}` } : {},
          body: formData
        });

        const contentType = res.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const resData = await res.json();
          if (!res.ok || resData.error) throw new Error(resData.error || 'Upload failed');
          return { data: resData.data, error: null };
        } else {
          if (!res.ok) throw new Error('Upload failed with status: ' + res.status);
          return { data: { path }, error: null };
        }
      } catch (e: any) {
        return { data: null, error: e };
      }
    };

    return bucket;
  };

  return client;
}

export const supabase: any = createSafeClient();

export default supabase;
export { setSessionCookie, clearSessionCookies };
