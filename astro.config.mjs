// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

import sitemap from '@astrojs/sitemap';
import { loadDotenv } from './scripts/load-dotenv.mjs';
import {
  DEFAULT_SITE_URL,
  sitemapChunks,
  serializeSitemapItem
} from './src/config/sitemapSeo.ts';

// https://astro.build/config
// Set PUBLIC_SITE_URL in Netlify (production) and locally for correct canonicals + sitemap.
loadDotenv(process.cwd(), { override: true });
const site = process.env.PUBLIC_SITE_URL || DEFAULT_SITE_URL;

export default defineConfig({
  site,

  integrations: [
    react(),
    sitemap({
      serialize: serializeSitemapItem,
      chunks: sitemapChunks
    })
  ],

  vite: {
    plugins: [tailwindcss()]
  }
});