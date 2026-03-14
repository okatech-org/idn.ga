import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8082,
  },
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    // Strip console.log/warn in production
    minify: "esbuild",
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React
          "vendor-react": ["react", "react-dom", "react-router-dom"],
          // UI framework
          "vendor-ui": [
            "@radix-ui/react-dialog",
            "@radix-ui/react-dropdown-menu",
            "@radix-ui/react-tabs",
            "@radix-ui/react-tooltip",
            "@radix-ui/react-select",
            "@radix-ui/react-popover",
            "@radix-ui/react-accordion",
            "@radix-ui/react-toast",
            "class-variance-authority",
            "clsx",
            "tailwind-merge",
            "lucide-react",
          ],
          // Data layer
          "vendor-data": [
            "@tanstack/react-query",
            "convex",
            "zustand",
            "zod",
          ],
          // Charts & PDF
          "vendor-charts": ["recharts"],
          "vendor-pdf": ["jspdf", "jspdf-autotable", "pdfmake"],
          // Animation
          "vendor-animation": ["framer-motion"],
          // Date utils
          "vendor-date": ["date-fns"],
        },
      },
    },
    // Strip console in production
    ...(mode === "production" && {
      esbuild: {
        drop: ["console", "debugger"],
      },
    }),
  },
  esbuild:
    mode === "production"
      ? {
          drop: ["console", "debugger"],
        }
      : undefined,
}));
