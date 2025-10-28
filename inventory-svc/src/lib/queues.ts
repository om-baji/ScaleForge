import { Queue } from 'bullmq';

export const notificationQueue = new Queue('notification', {
  connection: {
    url: process.env.REDIS_URL!,
  },
});
