"use client";

import axios from 'axios';
import { signOut } from 'next-auth/react';
import Image from 'next/image';
import { useEffect, useMemo, useState } from 'react';

import { Email } from '../types/email';
import { ComposeModal } from './compose-modal';
import { EmailTable } from './email-table';

const tabs = [
  { id: 'scheduled', label: 'Scheduled' },
  { id: 'sent', label: 'Sent' }
] as const;

type DashboardShellProps = {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
};

export function DashboardShell({ user }: DashboardShellProps) {
  const [activeTab, setActiveTab] = useState<(typeof tabs)[number]['id']>('scheduled');
  const [scheduled, setScheduled] = useState<Email[]>([]);
  const [sent, setSent] = useState<Email[]>([]);
  const [loading, setLoading] = useState(false);
  const [openCompose, setOpenCompose] = useState(false);

  const api = useMemo(
    () => axios.create({ baseURL: process.env.NEXT_PUBLIC_API_BASE_URL }),
    []
  );

  async function loadData() {
    setLoading(true);
    try {
      const [scheduledRes, sentRes] = await Promise.all([
        api.get<{ emails: Email[] }>('/api/scheduled'),
        api.get<{ emails: Email[] }>('/api/sent')
      ]);
      setScheduled(scheduledRes.data.emails);
      setSent(sentRes.data.emails);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const activeList = activeTab === 'scheduled' ? scheduled : sent;

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="text-3xl font-black tracking-tight">ONG</div>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-sm font-semibold">{user?.name ?? 'Logged user'}</div>
            <div className="text-xs text-gray-500">{user?.email}</div>
          </div>
          {user?.image && (
            <Image
              src={user.image}
              alt="avatar"
              width={38}
              height={38}
              className="rounded-full border"
            />
          )}
          <button
            onClick={() => signOut({ callbackUrl: '/' })}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            Logout
          </button>
        </div>
      </header>

      <div className="px-6 py-4 flex items-center gap-4">
        <div className="space-x-2 text-sm">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-full px-4 py-2 border ${
                activeTab === tab.id ? 'bg-primary text-white border-primary' : 'bg-white text-gray-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <button
          onClick={() => setOpenCompose(true)}
          className="ml-auto rounded-full bg-primary px-4 py-2 text-white font-semibold shadow-sm hover:bg-emerald-600"
        >
          Compose
        </button>
      </div>

      <div className="px-6 pb-10">
        <EmailTable items={activeList} loading={loading} variant={activeTab} />
      </div>

      <ComposeModal
        open={openCompose}
        onClose={() => setOpenCompose(false)}
        onCreated={() => {
          setOpenCompose(false);
          loadData();
        }}
      />
    </div>
  );
}
