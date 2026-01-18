import { redis } from './redis.js';
import { config } from './config.js';

export type RateLimitResult = {
  allowed: boolean;
  ttlMs: number;
};

const ONE_HOUR_MS = 60 * 60 * 1000;

function hourKey(sender: string) {
  const now = new Date();
  const key = `${now.getUTCFullYear()}${(now.getUTCMonth() + 1)
    .toString()
    .padStart(2, '0')}${now.getUTCDate().toString().padStart(2, '0')}T${now
    .getUTCHours()
    .toString()
    .padStart(2, '0')}`;
  return `rate:${sender}:${key}`;
}

// Lua for atomic check + expire
const script = `
local key = KEYS[1]
local limit = tonumber(ARGV[1])
local window = tonumber(ARGV[2])
local count = redis.call('GET', key)
if not count then
  redis.call('SET', key, 1, 'PX', window)
  return {1, window}
end
count = tonumber(count)
if count + 1 <= limit then
  local newCount = redis.call('INCR', key)
  local ttl = redis.call('PTTL', key)
  return {1, ttl}
else
  local ttl = redis.call('PTTL', key)
  return {0, ttl}
end
`;

export async function consumeRate(sender: string): Promise<RateLimitResult> {
  const key = hourKey(sender);
  const [allowedRaw, ttlRaw] = (await redis.eval(script, 1, key, config.maxEmailsPerHour, ONE_HOUR_MS)) as [
    number,
    number
  ];
  return { allowed: allowedRaw === 1, ttlMs: ttlRaw < 0 ? ONE_HOUR_MS : ttlRaw };
}
