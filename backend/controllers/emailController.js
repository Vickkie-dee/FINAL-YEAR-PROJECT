const db = require('../db/dbConnection');

function getAllEmails(req, res) {
  const emails = db.prepare('SELECT * FROM email_repository WHERE user_id = ? ORDER BY created_at DESC').all(req.userId);
  res.json(emails);
}

function getDashboardStats(req, res) {
  const total = db.prepare('SELECT COUNT(*) AS count FROM email_repository WHERE user_id = ?').get(req.userId).count;
  const statusCounts = db.prepare(`
    SELECT status, COUNT(*) AS count
    FROM email_repository
    WHERE user_id = ?
    GROUP BY status
  `).all(req.userId);

  const stats = { total, valid: 0, invalid: 0, risky: 0, duplicate: 0, inconclusive: 0, unvalidated: 0 };
  statusCounts.forEach(row => { stats[row.status] = row.count; });

  const validatedCount = total - stats.unvalidated;
  stats.percentValidated = total > 0 ? ((validatedCount / total) * 100).toFixed(1) : '0.0';

  res.json(stats);
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
      INSERT INTO email_repository (user_id, email, email_normalized, local_part, domain)
      VALUES (?, ?, ?, ?, ?)
    `).run(req.userId, email.trim(), normalized, localPart, domain);

    res.json({ message: 'Email added successfully', id: result.lastInsertRowid });
  } catch (err) {
    if (err.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: 'This email already exists in your repository' });
    }
    res.status(500).json({ error: 'Failed to add email', detail: err.message });
  }
}

function resetMyRepository(req, res) {
  try {
    const deleteLogs = db.prepare(`
      DELETE FROM validation_log WHERE email_id IN (
        SELECT id FROM email_repository WHERE user_id = ?
      )
    `);
    const deleteEmails = db.prepare(`DELETE FROM email_repository WHERE user_id = ?`);
    const deleteRuns = db.prepare(`DELETE FROM validation_runs WHERE user_id = ?`);
    const deleteBatches = db.prepare(`DELETE FROM upload_batches WHERE user_id = ?`);

    const resetTransaction = db.transaction((userId) => {
      deleteLogs.run(userId);
      deleteEmails.run(userId);
      deleteRuns.run(userId);
      deleteBatches.run(userId);
    });

    resetTransaction(req.userId);

    res.json({ message: 'Repository reset successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to reset repository', detail: err.message });
  }
}

module.exports = { getAllEmails, getDashboardStats, addSingleEmail, resetMyRepository };