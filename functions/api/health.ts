import { getHealth } from '../../src/lib/health';

export const onRequestGet: PagesFunction = () =>
  new Response(JSON.stringify(getHealth()), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store',
    },
  });
