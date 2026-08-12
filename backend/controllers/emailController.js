const db = require('../db/dbConnection');

function getAllEmails(req, res) {
  const emails = db.prepare('SELECT * FROM email_repository ORDER BY created_at DESC').all();
  res.json(emails);
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

module.exports = { getAllEmails, getDashboardStats };