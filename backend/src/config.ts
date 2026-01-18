import dotenv from 'dotenv';

dotenv.config();

const required = [
  'DATABASE_URL',
  'REDIS_URL',
  'QUEUE_NAME',
  'MAX_EMAILS_PER_HOUR',
  'MIN_DELAY_BETWEEN_MS'
];

for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`Missing required env var ${key}`);
  }
}

export const config = {
  port: Number(process.env.PORT ?? 4000),
  redisUrl: process.env.REDIS_URL as string,
  queueName: process.env.QUEUE_NAME as string,
  queueConcurrency: Number(process.env.QUEUE_CONCURRENCY ?? 5),
  minDelayBetweenMs: Number(process.env.MIN_DELAY_BETWEEN_MS ?? 2000),
  maxEmailsPerHour: Number(process.env.MAX_EMAILS_PER_HOUR ?? 200),
  etherealUser: process.env.ETHEREAL_USER,
  etherealPass: process.env.ETHEREAL_PASS
};
