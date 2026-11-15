const encoder = new TextEncoder();

export const STATE_MAX_AGE_SECONDS = 600;

function base64Url(value: ArrayBuffer | Uint8Array): string {
  const bytes = value instanceof Uint8Array ? value : new Uint8Array(value);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

async function hmac(secret: string, payload: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  return base64Url(await crypto.subtle.sign('HMAC', key, encoder.encode(payload)));
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let index = 0; index < a.length; index += 1) {
    diff |= a.charCodeAt(index) ^ b.charCodeAt(index);
  }
  return diff === 0;
}

/** Random state with an HMAC signature and issue time. */
export async function createState(secret: string, now = Date.now()): Promise<string> {
  const random = base64Url(crypto.getRandomValues(new Uint8Array(16)));
  const payload = `${random}.${Math.floor(now / 1000)}`;
  return `${payload}.${await hmac(secret, payload)}`;
}

/** Check the signature and the age. A stale or tampered value fails. */
export async function verifyState(
  value: string,
  secret: string,
  now = Date.now(),
): Promise<boolean> {
  const parts = value.split('.');
  if (parts.length !== 3) return false;

  const [random, issuedAt, signature] = parts;
  if (!random || !/^\d+$/.test(issuedAt) || !signature) return false;

  const expected = await hmac(secret, `${random}.${issuedAt}`);
  if (!timingSafeEqual(signature, expected)) return false;

  const age = Math.floor(now / 1000) - Number(issuedAt);
  return age >= 0 && age <= STATE_MAX_AGE_SECONDS;
}

/** Escape a value so it cannot close the inline script tag. */
function toScriptJson(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c');
}

/**
 * Decap opens this page in a popup and waits for a postMessage.
 * The token is sent only to the opener's own origin.
 */
export function renderCallback(
  status: 'success' | 'error',
  content: unknown,
  origin: string,
): string {
  const message = `authorization:github:${status}:${JSON.stringify(content)}`;
  return `<!doctype html>
<html lang="en">
  <head><meta charset="utf-8" /><title>GitHub login</title></head>
  <body>
    <p>Completing GitHub login…</p>
    <script>
      const origin = ${toScriptJson(origin)};
      const message = ${toScriptJson(message)};
      const receiveMessage = (event) => {
        if (event.origin !== origin || event.source !== window.opener || !window.opener) return;
        window.opener.postMessage(message, origin);
        window.removeEventListener('message', receiveMessage, false);
      };
      window.addEventListener('message', receiveMessage, false);
      if (window.opener) window.opener.postMessage('authorizing:github', origin);
    </script>
  </body>
</html>`;
}
