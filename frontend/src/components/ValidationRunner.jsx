import { useState } from 'react';
import { runValidation } from '../api';

const RESULT_COLORS = {
  valid: 'text-green-700',
  invalid: 'text-red-700',
  risky: 'text-yellow-700',
  duplicate: 'text-purple-700',
  inconclusive: 'text-orange-700',
};

export default function ValidationRunner() {
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const handleRun = async () => {
    setRunning(true);
    setError(null);
    setResult(null);
    try {
      const data = await runValidation();
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setRunning(false);
    }
  };

  return (
    <div className="p-6 max-w-lg">
      <h1 className="text-2xl font-bold mb-2">Validation Runner</h1>
      <p className="text-sm text-gray-500 mb-4">
        Runs all unvalidated records through the 4-stage validation pipeline: Syntax → Duplicate Check → Static Classification → DNS/MX Resolution.
      </p>

      <button
        onClick={handleRun}
        disabled={running}
        className="bg-blue-600 text-white px-6 py-3 rounded font-medium disabled:opacity-50"
      >
        {running ? 'Running validation... (this may take a few seconds)' : 'Run Validation'}
      </button>

      {error && <p className="text-red-600 mt-4">{error}</p>}

      {result && (
        <div className="mt-6 border rounded-lg p-4 bg-gray-50">
          <p className="font-medium mb-2">
            Run #{result.runId} complete — {result.totalProcessed} record(s) processed
          </p>
          <ul className="space-y-1">
            {Object.entries(result.counts).map(([status, count]) => (
              <li key={status} className={`text-sm ${RESULT_COLORS[status] || 'text-gray-700'}`}>
                <span className="font-semibold capitalize">{status}:</span> {count}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}