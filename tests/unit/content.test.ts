import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const contentDir = join(process.cwd(), 'src/content/courses');
const files = readdirSync(contentDir).filter((file) => file.endsWith('.md'));

const privatePatterns = [
  /youtube\.com/i,
  /youtu\.be/i,
  /videoId/i,
  /r2\.dev/i,
  /RAZORPAY_/,
  /FIREBASE_/,
  /PRIVATE KEY/,
];

describe('public course content', () => {
  it('has Markdown entries', () => {
    expect(files.length).toBeGreaterThan(0);
  });

  it('keeps private video IDs and paid resource keys out of Git content', () => {
    for (const file of files) {
      const source = readFileSync(join(contentDir, file), 'utf8');
      for (const pattern of privatePatterns) {
        expect(source, `${file} matches ${pattern}`).not.toMatch(pattern);
      }
    }
  });

  it('declares whether every entry is sample content', () => {
    for (const file of files) {
      const source = readFileSync(join(contentDir, file), 'utf8');
      expect(source, `${file} is missing a sample flag`).toMatch(/^sample:\s*(true|false)$/m);
    }
  });
});

describe('Decap CMS config', () => {
  const config = readFileSync(join(process.cwd(), 'public/admin/config.yml'), 'utf8');

  it('uses the self-hosted Cloudflare OAuth endpoint', () => {
    expect(config).toContain('auth_endpoint: /api/auth/github');
    expect(config).toContain('base_url: https://servicenow-learn-easy.pages.dev');
  });

  it('edits only public Markdown course content', () => {
    expect(config).toContain('folder: src/content/courses');
    expect(config).toContain('publish_mode: editorial_workflow');
    expect(config).not.toMatch(/videoId|razorpay|firebase/i);
  });
});
