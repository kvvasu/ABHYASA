import { describe, expect, it } from 'vitest';
import { APP_VERSION, getHealth } from '../../src/lib/health';

describe('getHealth', () => {
  it('returns ok with the application version', () => {
    expect(getHealth()).toEqual({ status: 'ok', version: APP_VERSION });
  });
});
