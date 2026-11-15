import { readFileSync, writeFileSync } from 'node:fs';

const siteUrl = process.env.CMS_SITE_URL;
if (!siteUrl) process.exit(0);

const url = new URL(siteUrl);
const loopback = ['127.0.0.1', '[::1]'].includes(url.hostname);
if (
  !['https:', 'http:'].includes(url.protocol) ||
  (url.protocol === 'http:' && !loopback) ||
  siteUrl !== url.origin ||
  url.search ||
  url.hash ||
  url.username ||
  url.password
) {
  throw new Error(
    'CMS_SITE_URL must be an HTTPS origin (HTTP is allowed for loopback development).',
  );
}

const configPath = new URL('../dist/admin/config.yml', import.meta.url);
const config = readFileSync(configPath, 'utf8');
const productionOrigin = 'https://servicenow-learn-easy.pages.dev';

writeFileSync(configPath, config.replaceAll(productionOrigin, url.origin));
