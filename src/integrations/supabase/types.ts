/**
 * Supabase Database Types Stub — Legacy Compatibility
 * 
 * This provides a minimal type definition to prevent TypeScript errors
 * in files that still reference Database['public']['Tables'] or Database['public']['Enums'].
 * 
 * TODO: Remove this file once all consumers are migrated to Convex types.
 */

export type Database = {
  public: {
    Tables: {
      [key: string]: {
        Row: Record<string, unknown>;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
    };
    Enums: {
      app_role: string;
      [key: string]: string;
    };
    Functions: Record<string, unknown>;
  };
};

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Enums<T extends keyof Database['public']['Enums']> = Database['public']['Enums'][T];
