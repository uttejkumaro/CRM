/**
 * redisClient.js
 * - Ensures dotenv is loaded at module import time (guards against import-order issues).
 * - Creates a real Upstash Redis client if URL+TOKEN exist.
 * - Otherwise exports a safe no-op stub with the same minimal API used by the app/worker (lpush, rpop, ping, lrange).
 */

import 'dotenv/config';
import { Redis } from '@upstash/redis';

const url = process.env.UPSTASH_REDIS_URL;
const token = process.env.UPSTASH_REDIS_TOKEN;

function makeStub() {
  console.warn('[Upstash Stub] UPSTASH_REDIS_URL or TOKEN missing - using in-memory stub.'); // prints once at import
  // simple in-memory queue for dev fallback
  const queues = new Map();

  return {
    // push value to left
    lpush: async (key, val) => {
      const arr = queues.get(key) || [];
      arr.unshift(val);
      queues.set(key, arr);
      return arr.length;
    },
    // pop from right
    rpop: async (key) => {
      const arr = queues.get(key) || [];
      const v = arr.pop();
      queues.set(key, arr);
      return v === undefined ? null : v;
    },
    // convenience: ping and simple get/set to mimic client
    ping: async () => 'PONG',
    set: async (k, v) => { queues.set('__kv_' + k, v); return 'OK'; },
    get: async (k) => queues.get('__kv_' + k) ?? null,
    lrange: async (key, start, stop) => {
      const arr = queues.get(key) || [];
      // simplistic slice semantics
      return arr.slice(start, stop + 1);
    }
  };
}

let redisClient;

if (!url || !token) {
  // export stub if env missing
  redisClient = makeStub();
} else {
  try {
    redisClient = new Redis({ url, token });
  } catch (err) {
    console.error('[Upstash] Failed to create client, falling back to stub:', err.message);
    redisClient = makeStub();
  }
}

export default redisClient;
