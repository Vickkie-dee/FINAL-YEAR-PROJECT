const db = require('../db/dbConnection');

function getAllEmails(req, res) {
  const emails = db.prepare('SELECT * FROM email_repository ORDER BY created_at DESC').all();
  res.json(emails);
}

function addSingleEmail(req, res) {
  const { email } = req.body;

  if (!email || typeof email !== 'string') {
    return res.status(400).json({ error: 'Email is required' });
  }

  const normalized = email.trim().toLowerCase();
  const parts = normalized.split('@');
  const localPart = parts[0] || '';
  const domain = parts[1] || '';

  try {
    const result = db.prepare(`
      INSERT INTO email_repository (email, email_normalized, local_part, domain)
      VALUES (?, ?, ?, ?)
    `).run(email.trim(), normalized, localPart, domain);

    res.json({
      message: 'Email added successfully',
      id: result.lastInsertRowid,
    });
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'This email already exists in the repository' });
    }
    res.status(500).json({ error: 'Failed to add email', detail: err.message });
  }
}

function getDashboardStats(req, res) {
  const total = db.prepare('SELECT COUNT(*) AS count FROM email_repository').get().count;
  const statusCounts = db.prepare(`
    SELECT status, COUNT(*) AS count
    FROM email_repository
    GROUP BY status
  `).all();

  const stats = {
    total,
    valid: 0,
    invalid: 0,
    risky: 0,
    duplicate: 0,
    inconclusive: 0,
    unvalidated: 0,
  };

  statusCounts.forEach(row => {
    stats[row.status] = row.count;
  });

  const validatedCount = total - stats.unvalidated;
  stats.percentValidated = total > 0 ? ((validatedCount / total) * 100).toFixed(1) : '0.0';

  res.json(stats);
}

module.exports = { getAllEmails, getDashboardStats, addSingleEmail };