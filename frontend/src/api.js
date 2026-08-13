const API_BASE = 'http://localhost:5000/api';

export async function fetchDashboardStats() {
  const res = await fetch(`${API_BASE}/dashboard`);
  if (!res.ok) throw new Error('Failed to fetch dashboard stats');
  return res.json();
}

export async function fetchEmails() {
  const res = await fetch(`${API_BASE}/emails`);
  if (!res.ok) throw new Error('Failed to fetch emails');
  return res.json();
}

export async function runValidation() {
  const res = await fetch(`${API_BASE}/validate/run`, { method: 'POST' });
  if (!res.ok) throw new Error('Validation run failed');
  return res.json();
}

export async function uploadCsv(file) {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(`${API_BASE}/upload`, { method: 'POST', body: formData });
  if (!res.ok) throw new Error('Upload failed');
  return res.json();
}