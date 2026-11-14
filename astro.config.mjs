import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import process from 'node:process';

export default defineConfig({
  site: process.env.SITE_URL ?? 'https://servicenow-learn-easy.pages.dev',
  output: 'static',
  vite: {
    plugins: [tailwindcss()],
  },
});
