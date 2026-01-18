export type EmailStatus = 'scheduled' | 'sent' | 'failed';

export interface Email {
  id: string;
  sender: string;
  recipient: string;
  subject: string;
  body: string;
  scheduledAt: string;
  sentAt?: string | null;
  status: EmailStatus;
  error?: string | null;
}
