import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        // Split stable third-party code into long-cached vendor chunks so it is
        // reused across deploys instead of re-downloaded with every app change.
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'supabase': ['@supabase/supabase-js'],
        },
      },
    },
  },
  // The previous config excluded lucide-react from Vite's dep optimizer,
  // which made every icon import a separate ESM re-export chain at runtime
  // and inflated the production bundle. Letting Vite pre-bundle the
  // package (the default) tree-shakes used icons cleanly. The exclude was
  // a workaround for an old HMR bug that no longer applies.
});
