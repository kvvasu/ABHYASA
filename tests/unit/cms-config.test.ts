import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';

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
