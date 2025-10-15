import { Queue } from 'bullmq';
import IORedis from 'ioredis';

let queue: Queue | null = null;

export function getQueue(): Queue {
  if (!queue) {
    const connection = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379', {
      // BullMQ v5 requires this to be null to avoid breaking blocking commands
      maxRetriesPerRequest: null,
    });
    queue = new Queue('jobs', { connection });
  }
  return queue;
}


