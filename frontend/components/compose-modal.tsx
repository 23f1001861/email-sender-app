"use client";

import axios from 'axios';
import Papa from 'papaparse';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

import { Email } from '../types/email';

function parseEmailsFromFile(file: File): Promise<string[]> {
  return new Promise((resolve, reject) => {
    Papa.parse<string[]>(file, {
      complete: (results) => {
        const emails = results.data
          .flat()
          .map((v) => (Array.isArray(v) ? v[0] : v))
          .filter(Boolean) as string[];
        resolve(emails);
      },
      error: reject
    });
  });
}

type ComposeModalProps = {
  open: boolean;
  onClose: () => void;
  onCreated: (emails: Email[]) => void;
};

export function ComposeModal({ open, onClose, onCreated }: ComposeModalProps) {
  const { data: session } = useSession();
  const [fromAddress, setFromAddress] = useState<string>(session?.user?.email ?? '');
  const [toList, setToList] = useState<string>('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [startTime, setStartTime] = useState<string>('');
  const [delaySeconds, setDelaySeconds] = useState(2);
  const [hourlyLimit, setHourlyLimit] = useState(50);
  const [fileName, setFileName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (session?.user?.email) {
      setFromAddress(session.user.email);
    }
  }, [session?.user?.email]);

  if (!open) return null;

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const emails = await parseEmailsFromFile(file);
    setFileName(`${file.name} (${emails.length} emails)`);
    setToList((prev) => {
      const current = prev ? prev.split(',').map((v) => v.trim()).filter(Boolean) : [];
      const merged = Array.from(new Set([...current, ...emails]));
      return merged.join(',');
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const recipients = toList
        .split(',')
        .map((v) => v.trim())
        .filter(Boolean);
      if (!recipients.length) {
        setError('Please add at least one recipient');
        setLoading(false);
        return;
      }
      const api = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_BASE_URL });
      const scheduledFor = startTime ? new Date(startTime).toISOString() : new Date().toISOString();
      await api.post('/api/schedule', {
        from: fromAddress,
        subject,
        body,
        recipients,
        startTime: scheduledFor,
        delayBetweenSeconds: delaySeconds,
        hourlyLimit
      });
      onCreated([]);
    } catch (err) {
      setError('Failed to schedule emails. Check inputs.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/30 py-10">
      <div className="w-full max-w-3xl rounded-2xl bg-white shadow-lg">
        <div className="flex items-center justify-between border-b px-6 py-4">
          <div className="text-lg font-semibold">Compose New Email</div>
          <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-800">
            Close
          </button>
        </div>
        <form onSubmit={handleSubmit} className="grid gap-4 px-6 py-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-gray-500">From</label>
              <input
                required
                value={fromAddress}
                className="mt-1 w-full rounded-lg border px-3 py-2"
                onChange={(e) => setFromAddress(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Start time</label>
              <input
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="mt-1 w-full rounded-lg border px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500">To</label>
            <input
              value={toList}
              onChange={(e) => setToList(e.target.value)}
              placeholder="recipient@example.com, another@example.com"
              className="mt-1 w-full rounded-lg border px-3 py-2"
            />
            <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
              <label className="cursor-pointer rounded-full border px-3 py-1 hover:bg-gray-50">
                Upload list
                <input type="file" accept=".csv,.txt" className="hidden" onChange={handleFile} />
              </label>
              <span>{fileName}</span>
            </div>
          </div>

          <div>
            <label className="text-xs text-gray-500">Subject</label>
            <input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="mt-1 w-full rounded-lg border px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="text-xs text-gray-500">Body</label>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
              className="mt-1 w-full rounded-lg border px-3 py-2"
              required
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-xs text-gray-500">Delay between emails (sec)</label>
              <input
                type="number"
                min={0}
                value={delaySeconds}
                onChange={(e) => setDelaySeconds(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border px-3 py-2"
              />
            </div>
            <div>
              <label className="text-xs text-gray-500">Hourly limit</label>
              <input
                type="number"
                min={1}
                value={hourlyLimit}
                onChange={(e) => setHourlyLimit(Number(e.target.value))}
                className="mt-1 w-full rounded-lg border px-3 py-2"
              />
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="flex items-center justify-end gap-2 py-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-4 py-2 text-gray-700 hover:bg-gray-50"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-full bg-primary px-5 py-2 text-white font-semibold shadow-sm hover:bg-emerald-600"
            >
              {loading ? 'Scheduling...' : 'Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
