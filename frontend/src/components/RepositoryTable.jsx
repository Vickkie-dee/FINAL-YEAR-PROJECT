import { useEffect, useState } from 'react';
import { fetchEmails } from '../api';

const STATUS_BADGE = {
  valid: 'bg-green-100 text-green-700',
  invalid: 'bg-red-100 text-red-700',
  risky: 'bg-yellow-100 text-yellow-700',
  duplicate: 'bg-purple-100 text-purple-700',
  inconclusive: 'bg-orange-100 text-orange-700',
  unvalidated: 'bg-gray-100 text-gray-700',
};

export default function RepositoryTable() {
  const [emails, setEmails] = useState([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
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

  const filtered = emails.filter((e) => {
    const matchesSearch = e.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) return <p className="p-4">Loading repository...</p>;
  if (error) return <p className="text-red-600 p-4">Error: {error}</p>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Email Repository</h1>

      <div className="flex gap-3 mb-4">
        <input
          type="text"
          placeholder="Search by email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded px-3 py-2 flex-1 max-w-sm"
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="border rounded px-3 py-2"
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

      <table className="w-full border-collapse">
        <thead>
          <tr className="text-left border-b">
            <th className="py-2 px-3">Email</th>
            <th className="py-2 px-3">Domain</th>
            <th className="py-2 px-3">Status</th>
            <th className="py-2 px-3">Failure Reason</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((e) => (
            <tr key={e.id} className="border-b hover:bg-gray-50">
              <td className="py-2 px-3">{e.email}</td>
              <td className="py-2 px-3">{e.domain}</td>
              <td className="py-2 px-3">
                <span className={`px-2 py-1 rounded text-xs font-medium ${STATUS_BADGE[e.status]}`}>
                  {e.status}
                </span>
              </td>
              <td className="py-2 px-3 text-sm text-gray-500">{e.failure_reason || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {filtered.length === 0 && (
        <p className="text-gray-500 mt-4">No records match your search/filter.</p>
      )}
    </div>
  );
}