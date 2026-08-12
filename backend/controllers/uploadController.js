const fs = require('fs');
const csv = require('csv-parser');
const db = require('../db/dbConnection');

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function uploadCsv(req, res) {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  const filePath = req.file.path;
  const rows = [];

  fs.createReadStream(filePath)
    .pipe(csv())
    .on('data', (row) => {
      // Assumes the CSV has a column literally named "email" (case-sensitive)
      if (row.email) rows.push(row.email);
    })
    .on('end', () => {
      const insertBatch = db.prepare(`
        INSERT INTO upload_batches (filename, total_rows, imported_rows, skipped_rows)
        VALUES (?, ?, 0, 0)
      `);
      const batchResult = insertBatch.run(req.file.originalname, rows.length);
      const batchId = batchResult.lastInsertRowid;

      const insertEmail = db.prepare(`
        INSERT OR IGNORE INTO email_repository
        (email, email_normalized, local_part, domain, source_batch_id)
        VALUES (?, ?, ?, ?, ?)
      `);

      let imported = 0;
      let skipped = 0;

      const insertMany = db.transaction((emails) => {
        for (const rawEmail of emails) {
          const normalized = normalizeEmail(rawEmail);
          const parts = normalized.split('@');
          const localPart = parts[0] || '';
          const domain = parts[1] || '';

          const result = insertEmail.run(rawEmail, normalized, localPart, domain, batchId);
          if (result.changes > 0) {
            imported++;
          } else {
            skipped++; // duplicate email_normalized, ignored by INSERT OR IGNORE
          }
        }
      });

      insertMany(rows);

      db.prepare(`
        UPDATE upload_batches SET imported_rows = ?, skipped_rows = ? WHERE id = ?
      `).run(imported, skipped, batchId);

      fs.unlinkSync(filePath); // clean up the temp uploaded file, it's in the DB now

      res.json({
        message: 'Upload complete',
        batchId,
        totalRows: rows.length,
        imported,
        skipped,
      });
    })
    .on('error', (err) => {
      res.status(500).json({ error: 'Failed to process CSV', detail: err.message });
    });
}

module.exports = { uploadCsv };