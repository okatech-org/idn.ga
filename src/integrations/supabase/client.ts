/**
 * Supabase Stub — Legacy Compatibility Layer
 * 
 * This file provides a no-op stub for the removed Supabase client.
 * All methods return empty/mock data to prevent runtime errors
 * during the migration from Supabase to Convex.
 * 
 * TODO: Progressively migrate each consumer to use Convex queries/mutations instead.
 */

const noopQuery = {
  select: () => noopQuery,
  insert: () => noopQuery,
  update: () => noopQuery,
  delete: () => noopQuery,
  eq: () => noopQuery,
  neq: () => noopQuery,
  gt: () => noopQuery,
  gte: () => noopQuery,
  lt: () => noopQuery,
  lte: () => noopQuery,
  like: () => noopQuery,
  ilike: () => noopQuery,
  in: () => noopQuery,
  is: () => noopQuery,
  order: () => noopQuery,
  limit: () => noopQuery,
  range: () => noopQuery,
  single: () => Promise.resolve({ data: null, error: null }),
  maybeSingle: () => Promise.resolve({ data: null, error: null }),
  then: (resolve: (value: { data: unknown[]; error: null }) => void) => resolve({ data: [], error: null }),
};

export const supabase = {
  from: (_table: string) => noopQuery,
  rpc: (_fn: string, _params?: Record<string, unknown>) => Promise.resolve({ data: null, error: null }),
  auth: {
    getUser: () => Promise.resolve({ data: { user: null }, error: null }),
    getSession: () => Promise.resolve({ data: { session: null }, error: null }),
    signInWithPassword: () => Promise.resolve({ data: { user: null, session: null }, error: null }),
    signUp: () => Promise.resolve({ data: { user: null, session: null }, error: null }),
    signOut: () => Promise.resolve({ error: null }),
    onAuthStateChange: (_callback: unknown) => ({ data: { subscription: { unsubscribe: () => {} } } }),
    signInWithOAuth: () => Promise.resolve({ data: { url: null, provider: null }, error: null }),
  },
  functions: {
    invoke: (fnName: string, _options?: Record<string, unknown>) => {
      console.warn(`[Supabase Stub] functions.invoke("${fnName}") — migrer vers Convex`);
      return Promise.resolve({ data: null, error: null });
    },
  },
  storage: {
    from: (_bucket: string) => ({
      upload: () => Promise.resolve({ data: null, error: null }),
      download: () => Promise.resolve({ data: null, error: null }),
      getPublicUrl: (_path: string) => ({ data: { publicUrl: '' } }),
      list: () => Promise.resolve({ data: [], error: null }),
      remove: () => Promise.resolve({ data: [], error: null }),
    }),
  },
  channel: (_name: string) => ({
    on: () => ({ subscribe: () => {} }),
    subscribe: () => {},
    unsubscribe: () => {},
  }),
  removeChannel: () => {},
};
