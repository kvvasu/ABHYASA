export const APP_VERSION = '0.1.0';

export interface HealthResponse {
  status: 'ok';
  version: string;
}

export function getHealth(): HealthResponse {
  return { status: 'ok', version: APP_VERSION };
}
