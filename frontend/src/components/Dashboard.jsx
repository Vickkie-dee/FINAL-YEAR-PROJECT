import { useEffect, useState } from 'react';
import { fetchDashboardStats, fetchEmails } from '../api';

const STATUS_META = {
  total:        { label: 'Total',        color: 'var(--ink)' },
  valid:        { label: 'Valid',        color: 'var(--verified)' },
  invalid:      { label: 'Invalid',      color: 'var(--invalid)' },
  risky:        { label: 'Risky',        color: 'var(--risky)' },
  duplicate:    { label: 'Duplicate',    color: 'var(--duplicate)' },
  inconclusive: { label: 'Inconclusive', color: 'var(--inconclusive)' },
  unvalidated:  { label: 'Unvalidated',  color: 'var(--muted)' },
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [allEmails, setAllEmails] = useState([]);
  const [loadingEmails, setLoadingEmails] = useState(false);

  useEffect(() => {
    fetchDashboardStats().then(setStats).catch((err) => setError(err.message));
  }, []);

  const handleCardClick = async (statusKey) => {
    if (selectedStatus === statusKey) {
      setSelectedStatus(null); // clicking the same card again collapses it
      return;
    }
    setSelectedStatus(statusKey);
    setLoadingEmails(true);
    try {
      const data = await fetchEmails();
      setAllEmails(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingEmails(false);
    }
  };

  if (error) return <p className="p-6 text-sm" style={{ color: 'var(--invalid)' }}>Error: {error}</p>;
  if (!stats) return <p className="p-6 text-sm" style={{ color: 'var(--muted)' }}>Loading dashboard…</p>;

  const keys = ['total', 'valid', 'invalid', 'risky', 'duplicate', 'inconclusive', 'unvalidated'];

  const filteredEmails = selectedStatus === 'total'
    ? allEmails
    : allEmails.filter((e) => e.status === selectedStatus);

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <div className="flex items-baseline justify-between mb-6">
        <h2 className="text-xl font-semibold" style={{ color: 'var(--ink-text)' }}>Repository Dashboard</h2>
        <p className="font-mono-tech text-xs" style={{ color: 'var(--muted)' }}>
          {stats.percentValidated}% VALIDATED
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {keys.map((key) => {
          const meta = STATUS_META[key];
          const isSelected = selectedStatus === key;
          return (
            <button
              key={key}
              onClick={() => handleCardClick(key)}
              className="bg-white rounded-lg p-4 text-left transition-shadow hover:shadow-md"
              style={{
                border: isSelected ? `1px solid ${meta.color}` : '1px solid var(--border)',
                borderLeft: `3px solid ${meta.color}`,
                boxShadow: isSelected ? `0 0 0 2px ${meta.color}33` : 'none',
              }}
            >
              <p className="font-mono-tech text-[10px] tracking-[0.1em] uppercase" style={{ color: 'var(--muted)' }}>
                {meta.label}
              </p>
              <p className="font-mono-tech text-3xl font-semibold mt-1" style={{ color: meta.color }}>
                {stats[key]}
              </p>
            </button>
          );
        })}
      </div>

      {selectedStatus && (
        <div className="mt-4 bg-white rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
          <div className="px-4 py-2.5 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)', background: 'var(--paper)' }}>
            <p className="font-mono-tech text-[11px] tracking-[0.08em] uppercase" style={{ color: 'var(--muted)' }}>
              {STATUS_META[selectedStatus].label} Records
            </p>
            <button
              onClick={() => setSelectedStatus(null)}
              className="text-xs font-mono-tech"
              style={{ color: 'var(--muted)' }}
            >
              CLOSE ✕
            </button>
          </div>

          {loadingEmails ? (
            <p className="text-sm p-4" style={{ color: 'var(--muted)' }}>Loading…</p>
          ) : filteredEmails.length === 0 ? (
            <p className="text-sm p-4" style={{ color: 'var(--muted)' }}>No records in this category.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-sm">
                <tbody>
                  {filteredEmails.map((e) => (
                    <tr key={e.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td className="py-2 px-4 whitespace-nowrap">{e.email}</td>
                      <td className="py-2 px-4 text-xs whitespace-nowrap" style={{ color: 'var(--muted)' }}>{e.domain}</td>
                      <td className="py-2 px-4 text-xs whitespace-nowrap" style={{ color: 'var(--muted)' }}>{e.failure_reason || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}