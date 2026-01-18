import { JobsOptions } from 'bullmq';
import nodemailer from 'nodemailer';

import { prisma } from './db.js';
import { config } from './config.js';
import { getTransporter } from './mailer.js';
import { emailQueue, createWorker } from './queue.js';
import { consumeRate } from './rateLimiter.js';

createWorker(async (job) => {
  const { emailId, sender } = job.data as { emailId: string; sender: string };
  const email = await prisma.email.findUnique({ where: { id: emailId } });
  if (!email) {
    return;
  }
  if (email.status !== 'scheduled') {
    return;
  }

  const rate = await consumeRate(sender);
  if (!rate.allowed) {
    const waitMs = rate.ttlMs + config.minDelayBetweenMs;
    const options: JobsOptions = {
      delay: waitMs,
      jobId: `email:${emailId}:retry:${Date.now()}`
    };
    await emailQueue.add('send-email', { emailId, sender }, options);
    return;
  }

  try {
    const transporter = await getTransporter();
    const info = await transporter.sendMail({
      from: sender,
      to: email.recipient,
      subject: email.subject,
      html: email.body
    });

    await prisma.email.update({
      where: { id: email.id },
      data: { status: 'sent', sentAt: new Date(), error: null }
    });

    console.log('Email sent', email.id, nodemailer.getTestMessageUrl?.(info));
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : 'Send failed';
    await prisma.email.update({
      where: { id: email.id },
      data: { status: 'failed', error: errMsg }
    });
    throw error;
  }
});

console.log('Worker running with concurrency', config.queueConcurrency);
