import nodemailer from 'nodemailer';

import { config } from './config.js';

let transporterPromise: Promise<nodemailer.Transporter> | null = null;

async function buildTransporter() {
  if (config.etherealUser && config.etherealPass) {
    return nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: { user: config.etherealUser, pass: config.etherealPass }
    });
  }

  const account = await nodemailer.createTestAccount();
  return nodemailer.createTransport({
    host: account.smtp.host,
    port: account.smtp.port,
    secure: account.smtp.secure,
    auth: { user: account.user, pass: account.pass }
  });
}

export async function getTransporter() {
  if (!transporterPromise) {
    transporterPromise = buildTransporter();
  }
  return transporterPromise;
}
