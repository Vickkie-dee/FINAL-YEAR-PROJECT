import { getUserId } from './userIdentity';

const API_BASE = 'http://localhost:5000/api';

function headers(extra = {}) {
  return { 'X-User-Id': getUserId(), ...extra };
}

export async function fetchDashboardStats() {
  const res = await fetch(`${API_BASE}/dashboard`, { headers: headers() });
  if (!res.ok) throw new Error('Failed to fetch dashboard stats');
  return res.json();
}

export async function fetchEmails() {
  const res = await fetch(`${API_BASE}/emails`, { headers: headers() });
  if (!res.ok) throw new Error('Failed to fetch emails');
  return res.json();
}

export async function runValidation() {
  const res = await fetch(`${API_BASE}/validate/run`, { method: 'POST', headers: headers() });
  if (!res.ok) throw new Error('Validation run failed');
  return res.json();
}

export async function uploadCsv(file) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/upload`, {
    method: 'POST',
    headers: headers(),
    body: formData,
  });
  if (!res.ok) throw new Error('Upload failed');
  return res.json();
}

export async function addSingleEmail(email) {
  const res = await fetch(`${API_BASE}/emails`, {
    method: 'POST',
    headers: headers({ 'Content-Type': 'application/json' }),
    body: JSON.stringify({ email }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Failed to add email');
  return data;
}

export async function resetRepository() {
  const res = await fetch(`${API_BASE}/emails/reset`, { method: 'DELETE', headers: headers() });
  if (!res.ok) throw new Error('Failed to reset repository');
  return res.json();
}