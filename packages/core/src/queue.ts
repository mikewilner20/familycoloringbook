import { Queue, Worker, QueueEvents, Job } from 'bullmq';
import Redis from 'ioredis';
import { env } from './env';

const connection = new Redis(env.REDIS_URL);

export const lineArtQueueName = 'lineArt';
export const pdfQueueName = 'pdf';

export function createQueue(name: string) {
  return new Queue(name, { connection });
}

export function createWorker<T>(name: string, handler: (job: Job<T>) => Promise<void>) {
  const worker = new Worker(name, handler, { connection });
  const events = new QueueEvents(name, { connection });
  events.on('failed', ({ jobId, failedReason }) => {
    console.error(`Job ${jobId} in ${name} failed:`, failedReason);
  });
  return { worker, events };
}
