import { readFileSync, writeFileSync } from 'node:fs';
import { pathToFileURL } from 'node:url';
import { resolve } from 'node:path';

const productionOrigin = 'https://servicenow-learn-easy.pages.dev';

export function configureAdminConfig({
  configPath = new URL('../dist/admin/config.yml', import.meta.url),
  env = process.env,
} = {}) {
  const config = readFileSync(configPath, 'utf8');
  let siteUrl = env.CMS_SITE_URL;

  if (!siteUrl && env.CF_PAGES_BRANCH && env.CF_PAGES_BRANCH !== 'main') {
    siteUrl = previewOrigin(env.CF_PAGES_BRANCH, env.CF_PAGES_URL);
  }
  if (!siteUrl) return;

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

  writeFileSync(configPath, config.replaceAll(productionOrigin, url.origin));
}

function previewOrigin(branch, deploymentUrl) {
  if (!deploymentUrl) {
    throw new Error('CF_PAGES_URL is required to configure a Preview CMS URL.');
  }

  const deployment = new URL(deploymentUrl);
  const [deploymentId, ...projectDomain] = deployment.hostname.split('.');
  if (
    deployment.protocol !== 'https:' ||
    !deployment.hostname.endsWith('.pages.dev') ||
    deployment.username ||
    deployment.password ||
    deployment.port ||
    deployment.search ||
    deployment.hash ||
    !deploymentId ||
    projectDomain.length < 2
  ) {
    throw new Error('CF_PAGES_URL must be a Cloudflare Pages deployment URL.');
  }

  const branchAlias = branch
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .slice(0, 28)
    .replace(/-+$/, '');
  if (!branchAlias) throw new Error('CF_PAGES_BRANCH is not a valid Preview branch.');

  return `https://${branchAlias}.${projectDomain.join('.')}`;
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  configureAdminConfig();
}
