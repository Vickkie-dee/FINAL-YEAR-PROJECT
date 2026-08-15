import { useEffect, useState, useCallback } from 'react';
import { fetchEmails } from '../api';
import ActionsPanel from './ActionsPanel';

const STATUS_META = {
  valid:        { color: 'var(--verified)' },
  invalid:      { color: 'var(--invalid)' },
  risky:        { color: 'var(--risky)' },
  duplicate:    { color: 'var(--duplicate)' },
  inconclusive: { color: 'var(--inconclusive)' },
  unvalidated:  { color: 'var(--muted)' },
};

export default function RepositoryTable() {
  const [emails, setEmails] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadEmails = useCallback(() => {
    setLoading(true);
    fetchEmails()
      .then((data) => {
        setEmails(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    loadEmails();
  }, [loadEmails]);

  const filtered = emails.filter((e) => {
    const matchesSearch = e.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <h2 className="text-xl font-semibold mb-4" style={{ color: 'var(--ink-text)' }}>Email Repository</h2>

      <ActionsPanel onChanged={loadEmails} />

      {error && <p className="text-sm mb-4" style={{ color: 'var(--invalid)' }}>Error: {error}</p>}

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <input
          type="text"
          placeholder="Search by email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="rounded px-3 py-2 flex-1 sm:max-w-sm text-sm"
          style={{ border: '1px solid var(--border)' }}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded px-3 py-2 text-sm"
          style={{ border: '1px solid var(--border)' }}
        >
          <option value="all">All Statuses</option>
          <option value="valid">Valid</option>
          <option value="invalid">Invalid</option>
          <option value="risky">Risky</option>
          <option value="duplicate">Duplicate</option>
          <option value="inconclusive">Inconclusive</option>
          <option value="unvalidated">Unvalidated</option>
        </select>
      </div>

      {loading ? (
        <p className="text-sm" style={{ color: 'var(--muted)' }}>Loading…</p>
      ) : (
        <div className="bg-white rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="text-left" style={{ borderBottom: '1px solid var(--border)' }}>
                  <th className="py-2.5 px-3 font-mono-tech text-[10px] tracking-[0.08em] uppercase whitespace-nowrap" style={{ color: 'var(--muted)' }}>Email</th>
                  <th className="py-2.5 px-3 font-mono-tech text-[10px] tracking-[0.08em] uppercase whitespace-nowrap" style={{ color: 'var(--muted)' }}>Domain</th>
                  <th className="py-2.5 px-3 font-mono-tech text-[10px] tracking-[0.08em] uppercase whitespace-nowrap" style={{ color: 'var(--muted)' }}>Status</th>
                  <th className="py-2.5 px-3 font-mono-tech text-[10px] tracking-[0.08em] uppercase whitespace-nowrap" style={{ color: 'var(--muted)' }}>Reason</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => {
                  const meta = STATUS_META[e.status] || { color: 'var(--muted)' };
                  return (
                    <tr key={e.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td className="py-2.5 px-3 whitespace-nowrap">{e.email}</td>
                      <td className="py-2.5 px-3 whitespace-nowrap" style={{ color: 'var(--muted)' }}>{e.domain}</td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span
                          className="font-mono-tech text-[10px] tracking-[0.05em] uppercase px-2 py-1 rounded inline-flex items-center gap-1.5"
                          style={{ background: `${meta.color}1A`, color: meta.color }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full" style={{ background: meta.color }} />
                          {e.status}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-xs whitespace-nowrap" style={{ color: 'var(--muted)' }}>{e.failure_reason || '—'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <p className="text-sm p-4" style={{ color: 'var(--muted)' }}>No records match your search/filter.</p>
          )}
        </div>
      )}
    </div>
  );
}