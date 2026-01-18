import { Email } from '../types/email';

type Props = {
  items: Email[];
  loading: boolean;
  variant: 'scheduled' | 'sent';
};

export function EmailTable({ items, loading, variant }: Props) {
  if (loading) {
    return <div className="rounded-xl border bg-white p-6 text-center">Loading...</div>;
  }

  if (!items.length) {
    return (
      <div className="rounded-xl border bg-white p-6 text-center text-gray-500">
        {variant === 'scheduled' ? 'No scheduled emails' : 'No sent emails yet'}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border bg-white">
      <table className="min-w-full divide-y divide-gray-100">
        <thead className="bg-gray-50 text-left text-sm font-semibold text-gray-600">
          <tr>
            <th className="px-4 py-3">Email</th>
            <th className="px-4 py-3">Subject</th>
            <th className="px-4 py-3">Scheduled / Sent</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100 text-sm">
          {items.map((item) => (
            <tr key={item.id} className="hover:bg-gray-50">
              <td className="px-4 py-3 text-gray-800">{item.recipient}</td>
              <td className="px-4 py-3 text-gray-700">{item.subject}</td>
              <td className="px-4 py-3 text-gray-600">
                {variant === 'scheduled'
                  ? new Date(item.scheduledAt).toLocaleString()
                  : item.sentAt
                  ? new Date(item.sentAt).toLocaleString()
                  : '—'}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    item.status === 'sent'
                      ? 'bg-emerald-100 text-emerald-700'
                      : item.status === 'scheduled'
                      ? 'bg-amber-100 text-amber-700'
                      : 'bg-red-100 text-red-700'
                  }`}
                >
                  {item.status}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
