import express from 'express';
import { z } from 'zod';

import { prisma } from '../db.js';
import { emailQueue } from '../queue.js';
import { config } from '../config.js';

const router = express.Router();

const scheduleSchema = z.object({
  from: z.string().email(),
  subject: z.string().min(1),
  body: z.string().min(1),
  recipients: z.array(z.string().email()).min(1),
  startTime: z.string().datetime(),
  delayBetweenSeconds: z.number().int().nonnegative().default(2),
  hourlyLimit: z.number().int().positive().default(config.maxEmailsPerHour)
});

router.post('/schedule', async (req, res, next) => {
  try {
    const payload = scheduleSchema.parse(req.body);
    const base = new Date(payload.startTime).getTime();
    const created: string[] = [];

    for (const [index, recipient] of payload.recipients.entries()) {
      const scheduledAt = new Date(
        base + index * payload.delayBetweenSeconds * 1000
      );

      const email = await prisma.email.create({
        data: {
          sender: payload.from,
          recipient,
          subject: payload.subject,
          body: payload.body,
          scheduledAt,
          delaySeconds: payload.delayBetweenSeconds,
          hourlyLimit: payload.hourlyLimit
        }
      });
      created.push(email.id);

      const delay = Math.max(scheduledAt.getTime() - Date.now(), 0);
      await emailQueue.add(
        'send-email',
        { emailId: email.id, sender: payload.from },
        {
          jobId: `email:${email.id}:init`,
          delay
        }
      );
    }

    return res.status(201).json({
      message: 'Emails scheduled',
      count: created.length,
      ids: created
    });
  } catch (error) {
    return next(error);
  }
});

router.get('/scheduled', async (_req, res, next) => {
  try {
    const emails = await prisma.email.findMany({
      where: { status: 'scheduled' },
      orderBy: { scheduledAt: 'asc' },
      take: 200
    });
    return res.json({ emails });
  } catch (error) {
    return next(error);
  }
});

router.get('/sent', async (_req, res, next) => {
  try {
    const emails = await prisma.email.findMany({
      where: { status: { in: ['sent', 'failed'] } },
      orderBy: { sentAt: 'desc' },
      take: 200
    });
    return res.json({ emails });
  } catch (error) {
    return next(error);
  }
});

export default router;
