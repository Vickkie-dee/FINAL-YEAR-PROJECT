import { useState } from 'react';

const API_BASE = 'http://localhost:5000/api';

export default function SingleEntryView() {
  const [email, setEmail] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setSubmitting(true);
    setResult(null);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/emails`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to add email');
      } else {
        setResult(data);
        setEmail('');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-lg">
      <h1 className="text-2xl font-bold mb-4">Add Single Email</h1>

      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="text"
          placeholder="someone@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="border rounded px-3 py-2 flex-1"
        />
        <button
          type="submit"
          disabled={submitting}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {submitting ? 'Adding...' : 'Add'}
        </button>
      </form>

      {error && (
        <p className="text-red-600 mt-4 bg-red-50 border border-red-200 rounded p-3">{error}</p>
      )}

      {result && (
        <p className="text-green-700 mt-4 bg-green-50 border border-green-200 rounded p-3">
          {result.message} (id: {result.id})
        </p>
      )}
    </div>
  );
}