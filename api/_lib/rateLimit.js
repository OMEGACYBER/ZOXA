// Distributed rate limiting helper for Vercel serverless
// Uses Upstash Redis REST API if available, otherwise falls back to in-memory window

const memoryStore = new Map();

export function getClientIp(req) {
  const xf = req.headers['x-forwarded-for'];
  if (typeof xf === 'string' && xf.length > 0) return xf.split(',')[0].trim();
  return req.headers['x-real-ip'] || req.connection?.remoteAddress || 'unknown';
}

async function upstashIncrWithExpire(key, windowSeconds) {
  const baseUrl = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!baseUrl || !token) return null;
  try {
    // INCR key
    const incrRes = await fetch(`${baseUrl}/incr/${encodeURIComponent(key)}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const incrJson = await incrRes.json();
    const value = typeof incrJson?.result === 'number' ? incrJson.result : Number(incrJson?.result);

    // If first increment, set expiry
    if (value === 1) {
      await fetch(`${baseUrl}/expire/${encodeURIComponent(key)}/${windowSeconds}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    }
    return value;
  } catch (e) {
    console.warn('Upstash rate limit error:', e);
    return null;
  }
}

export async function checkRateLimit(ip, windowSeconds = 60, maxRequests = 10) {
  const key = `ratelimit:${ip}`;

  // Try distributed first
  const distributedValue = await upstashIncrWithExpire(key, windowSeconds);
  if (distributedValue !== null) {
    return distributedValue <= maxRequests;
  }

  // Fallback to in-memory (per-instance)
  const now = Date.now();
  const windowStart = now - windowSeconds * 1000;
  const arr = memoryStore.get(key) || [];
  const recent = arr.filter((ts) => ts > windowStart);
  recent.push(now);
  memoryStore.set(key, recent);
  return recent.length <= maxRequests;
}
