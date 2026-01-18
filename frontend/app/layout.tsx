import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { SessionWrapper } from '../components/session-provider';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ReachInbox Email Scheduler',
  description: 'Schedule and track outreach emails'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionWrapper>{children}</SessionWrapper>
      </body>
    </html>
  );
}
