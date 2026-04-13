
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  define: {
    'process.env.GEMINI_API_KEY': JSON.stringify(process.env.GEMINI_API_KEY),
    'process.env.GYM_TRACK': JSON.stringify(process.env.GYM_TRACK),
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
});
