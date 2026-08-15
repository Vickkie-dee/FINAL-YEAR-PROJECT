const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'repository.db');
const schemaPath = path.join(__dirname, 'schema.sql');

const db = new Database(dbPath);
db.pragma('journal_mode = WAL');

// Ensure schema exists every time the app starts — safe because
// CREATE TABLE IF NOT EXISTS does nothing if tables are already there.
// This makes deployment self-healing if Render's disk ever resets.
const schema = fs.readFileSync(schemaPath, 'utf8');
db.exec(schema);

module.exports = db;