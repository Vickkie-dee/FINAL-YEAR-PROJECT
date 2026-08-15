import { useState } from 'react';
import { uploadCsv, runValidation, addSingleEmail, resetRepository } from '../api';

function UploadIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 16V4M12 4L7 9M12 4l5 5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M4 16v3a1 1 0 001 1h14a1 1 0 001-1v-3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MailPlusIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="5" width="14" height="12" rx="2" />
      <path d="M3 7l7 5 7-5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M19 9v6M16 12h6" strokeLinecap="round" />
    </svg>
  );
}

function ShieldCheckIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3l7 3v6c0 4.5-3 7.5-7 9-4-1.5-7-4.5-7-9V6l7-3z" strokeLinejoin="round" />
      <path d="M9 12l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ActionCard({ icon, title, subtitle, children, accent }) {
  return (
    <div className="bg-white rounded-lg p-4 flex-1" style={{ border: '1px solid var(--border)' }}>
      <div className="flex items-center gap-2 mb-1">
        <div style={{ color: accent }}>{icon}</div>
        <p className="font-semibold text-sm" style={{ color: 'var(--ink-text)' }}>{title}</p>
      </div>
      <p className="text-xs mb-3" style={{ color: 'var(--muted)' }}>{subtitle}</p>
      {children}
    </div>
  );
}

export default function ActionsPanel({ onChanged }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadMsg, setUploadMsg] = useState(null);

  const [email, setEmail] = useState('');
  const [adding, setAdding] = useState(false);
  const [addMsg, setAddMsg] = useState(null);

  const [validating, setValidating] = useState(false);
  const [validateMsg, setValidateMsg] = useState(null);

  const [resetting, setResetting] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setUploadMsg(null);
    try {
      const data = await uploadCsv(file);
      setUploadMsg({ ok: true, text: `Imported ${data.imported}, skipped ${data.skipped}` });
      setFile(null);
      onChanged?.();
    } catch (err) {
      setUploadMsg({ ok: false, text: err.message });
    } finally {
      setUploading(false);
    }
  };

  const handleAddEmail = async () => {
    if (!email.trim()) return;
    setAdding(true);
    setAddMsg(null);
    try {
      await addSingleEmail(email.trim());
      setAddMsg({ ok: true, text: 'Added successfully' });
      setEmail('');
      onChanged?.();
    } catch (err) {
      setAddMsg({ ok: false, text: err.message });
    } finally {
      setAdding(false);
    }
  };

  const handleValidate = async () => {
    setValidating(true);
    setValidateMsg(null);
    try {
      const data = await runValidation();
      const summary = Object.entries(data.counts)
        .filter(([, v]) => v > 0)
        .map(([k, v]) => `${v} ${k}`)
        .join(', ') || 'nothing pending';
      setValidateMsg({ ok: true, text: `Run #${data.runId}: ${summary}` });
      onChanged?.();
    } catch (err) {
      setValidateMsg({ ok: false, text: err.message });
    } finally {
      setValidating(false);
    }
  };

  const handleReset = async () => {
    const confirmed = window.confirm('This will permanently delete all your repository data. Continue?');
    if (!confirmed) return;

    setResetting(true);
    try {
      await resetRepository();
      onChanged?.();
    } catch (err) {
      alert('Reset failed: ' + err.message);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="mb-6">
      <div className="flex flex-col md:flex-row gap-3">
        <ActionCard icon={<UploadIcon />} title="Upload CSV" subtitle="Bulk import from file" accent="var(--verified)">
          <div className="flex gap-2">
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setFile(e.target.files[0])}
              className="text-xs flex-1 min-w-0"
            />
            <button
              onClick={handleUpload}
              disabled={uploading || !file}
              className="font-mono-tech text-xs px-3 py-1.5 rounded text-white disabled:opacity-40 shrink-0"
              style={{ background: 'var(--verified)' }}
            >
              {uploading ? '...' : 'GO'}
            </button>
          </div>
          {uploadMsg && (
            <p className="text-xs mt-2" style={{ color: uploadMsg.ok ? 'var(--verified)' : 'var(--invalid)' }}>
              {uploadMsg.text}
            </p>
          )}
        </ActionCard>

        <ActionCard icon={<MailPlusIcon />} title="Add Email" subtitle="Single record entry" accent="var(--duplicate)">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="someone@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="text-xs flex-1 min-w-0 px-2 py-1.5 rounded"
              style={{ border: '1px solid var(--border)' }}
            />
            <button
              onClick={handleAddEmail}
              disabled={adding || !email.trim()}
              className="font-mono-tech text-xs px-3 py-1.5 rounded text-white disabled:opacity-40 shrink-0"
              style={{ background: 'var(--duplicate)' }}
            >
              {adding ? '...' : 'ADD'}
            </button>
          </div>
          {addMsg && (
            <p className="text-xs mt-2" style={{ color: addMsg.ok ? 'var(--verified)' : 'var(--invalid)' }}>
              {addMsg.text}
            </p>
          )}
        </ActionCard>

        <ActionCard icon={<ShieldCheckIcon />} title="Validate" subtitle="Run pending records" accent="var(--risky)">
          <button
            onClick={handleValidate}
            disabled={validating}
            className="font-mono-tech text-xs px-3 py-1.5 rounded text-white disabled:opacity-40 w-full"
            style={{ background: 'var(--risky)' }}
          >
            {validating ? 'RUNNING…' : 'RUN VALIDATION'}
          </button>
          {validateMsg && (
            <p className="text-xs mt-2" style={{ color: validateMsg.ok ? 'var(--verified)' : 'var(--invalid)' }}>
              {validateMsg.text}
            </p>
          )}
        </ActionCard>
      </div>

      <div className="flex justify-end mt-3">
        <button
          onClick={handleReset}
          disabled={resetting}
          className="font-mono-tech text-xs px-3 py-2 rounded disabled:opacity-40"
          style={{ color: 'var(--invalid)', border: '1px solid var(--invalid)' }}
        >
          {resetting ? 'CLEARING…' : 'RESET REPOSITORY'}
        </button>
      </div>
    </div>
  );
}