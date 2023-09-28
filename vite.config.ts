import { defineConfig } from 'vite';
import svgrPlugin from 'vite-plugin-svgr';
import react from '@vitejs/plugin-react';
import viteTsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  build: {
    outDir: "build",
  },
  server: {
    port: 3000,
  },
  plugins: [
    viteTsconfigPaths(),
    react(),
  ],
});
