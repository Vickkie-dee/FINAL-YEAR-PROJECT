import { useEffect, useState } from 'react';
import { fetchDashboardStats } from '../api';

const STATUS_COLORS = {
  total: 'bg-slate-100 text-slate-700',
  valid: 'bg-green-100 text-green-700',
  invalid: 'bg-red-100 text-red-700',
  risky: 'bg-yellow-100 text-yellow-700',
  duplicate: 'bg-purple-100 text-purple-700',
  inconclusive: 'bg-orange-100 text-orange-700',
  unvalidated: 'bg-gray-100 text-gray-700',
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardStats()
      .then(setStats)
      .catch((err) => setError(err.message));
  }, []);

  if (error) return <p className="text-red-600 p-4">Error: {error}</p>;
  if (!stats) return <p className="p-4">Loading dashboard...</p>;

  const cards = [
    { label: 'Total', value: stats.total, key: 'total' },
    { label: 'Valid', value: stats.valid, key: 'valid' },
    { label: 'Invalid', value: stats.invalid, key: 'invalid' },
    { label: 'Risky', value: stats.risky, key: 'risky' },
    { label: 'Duplicate', value: stats.duplicate, key: 'duplicate' },
    { label: 'Inconclusive', value: stats.inconclusive, key: 'inconclusive' },
    { label: 'Unvalidated', value: stats.unvalidated, key: 'unvalidated' },
  ];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Repository Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {cards.map((card) => (
          <div key={card.key} className={`rounded-lg p-4 ${STATUS_COLORS[card.key]}`}>
            <p className="text-sm font-medium">{card.label}</p>
            <p className="text-3xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-blue-50 text-blue-800 rounded-lg p-4 inline-block">
        <p className="text-sm font-medium">% Validated</p>
        <p className="text-2xl font-bold">{stats.percentValidated}%</p>
      </div>
    </div>
  );
}