import { Queue, Worker } from 'bullmq';

import { config } from './config.js';
import { redis } from './redis.js';

export const emailQueue = new Queue(config.queueName, {
  connection: redis,
  defaultJobOptions: {
    removeOnComplete: true,
    removeOnFail: false
  },
  limiter: {
    max: 1,
    duration: config.minDelayBetweenMs
  }
});

export function createWorker(processor: Parameters<typeof Worker>[1]) {
  return new Worker(config.queueName, processor, {
    connection: redis,
    concurrency: config.queueConcurrency
  });
}
