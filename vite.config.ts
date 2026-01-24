import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Supabase project URL for Edge Functions
const SUPABASE_URL = "https://jvukslcsgbihcptnkpll.supabase.co";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8082,
    proxy: {
      // Proxy OAuth token endpoint to Supabase Edge Function
      '/oauth/token': {
        target: `${SUPABASE_URL}/functions/v1`,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/oauth\/token/, '/oauth-token'),
      },
      // Proxy OAuth userinfo endpoint to Supabase Edge Function
      '/oauth/userinfo': {
        target: `${SUPABASE_URL}/functions/v1`,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/oauth\/userinfo/, '/oauth-userinfo'),
      },
    },
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
