import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';
import { configureAdminConfig } from '../../scripts/configure-admin-config.mjs';

// Decap CMS validates config.yml against a JSON schema at runtime. A missing
// required property shows "Error loading the CMS configuration" in /admin/.
// The schema ships inside the CMS bundle, so the CDN pin in public/admin/index.html
// determines which schema applies. These checks mirror the structural rules.
const entry = readFileSync(join(process.cwd(), 'public/admin/index.html'), 'utf8');
const source = readFileSync(join(process.cwd(), 'public/admin/config.yml'), 'utf8');
const config = parse(source);
const collection = config.collections?.[0] ?? {};
const topLevelMediaKeys = source
  .split('\n')
  .filter((line) => /^media_/.test(line))
  .map((line) => line.split(':')[0]);

describe('Decap CMS config', () => {
  it('generates the current Cloudflare Preview hostname when build vars are absent', () => {
    const directory = mkdtempSync(join(tmpdir(), 'abhyasa-cms-config-'));
    const configPath = pathToFileURL(join(directory, 'config.yml'));
    try {
      writeFileSync(configPath, source);
      configureAdminConfig({
        configPath,
        env: {
          CF_PAGES_BRANCH: 'feature/phase-04-content-management',
          CF_PAGES_URL: 'https://f99228f.servicenow-learn-easy.pages.dev',
        },
      });

      const generated = parse(readFileSync(configPath, 'utf8'));
      expect(generated.backend.base_url).toBe(
        'https://feature-phase-04-content-man.servicenow-learn-easy.pages.dev',
      );
      expect(generated.backend.site_domain).toBe(generated.backend.base_url);
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it('uses CMS_SITE_URL when explicitly configured and preserves production defaults otherwise', () => {
    const directory = mkdtempSync(join(tmpdir(), 'abhyasa-cms-config-'));
    const configPath = pathToFileURL(join(directory, 'config.yml'));
    try {
      writeFileSync(configPath, source);
      configureAdminConfig({ configPath, env: { CMS_SITE_URL: 'https://preview.example' } });
      expect(parse(readFileSync(configPath, 'utf8')).backend.base_url).toBe(
        'https://preview.example',
      );

      writeFileSync(configPath, source);
      configureAdminConfig({ configPath, env: { CF_PAGES_BRANCH: 'main' } });
      expect(parse(readFileSync(configPath, 'utf8')).backend.base_url).toBe(
        'https://servicenow-learn-easy.pages.dev',
      );
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });

  it('pins the Decap bundle to an exact version', () => {
    expect(entry.match(/decap-cms@(\d+\.\d+\.\d+)\//)?.[1]).toBe('3.17.3');
  });

  it('declares the required media_folder at the top level', () => {
    expect(config.media_folder).toBe('public/uploads/public');
    expect(config.media_library).toBeUndefined();
    expect(topLevelMediaKeys).toContain('media_folder');
    expect(collection).not.toHaveProperty('media_folder');
  });

  it('keeps uploads out of the course content folder', () => {
    expect(config.media_folder).toMatch(/^public\/uploads\/public$/);
    expect(config.public_folder).toBe('/uploads/public');
    expect(config.media_folder.startsWith(collection.folder)).toBe(false);
  });

  it('points the GitHub backend at the editor branch', () => {
    expect(config.backend).toMatchObject({
      name: 'github',
      repo: 'kvvasu/ABHYASA',
      branch: 'develop',
      auth_endpoint: '/api/auth/github',
    });
    expect(config.backend.base_url).toBe(config.backend.site_domain);
    expect(new URL(config.backend.base_url).origin).toBe(config.backend.base_url);
  });

  it('uses the editorial workflow', () => {
    expect(config.publish_mode).toBe('editorial_workflow');
  });

  it('edits only public course Markdown', () => {
    expect(config.collections).toHaveLength(1);
    expect(collection).toMatchObject({
      name: 'courses',
      folder: 'src/content/courses',
      extension: 'md',
      format: 'frontmatter',
    });
  });

  it('exposes no video, payment, or credential field', () => {
    expect(source).not.toMatch(/videoId|youtube|razorpay|firebase|client_secret|private_key/i);
  });
});
