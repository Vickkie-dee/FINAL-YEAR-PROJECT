const db = require('./dbConnection');

db.exec('DELETE FROM validation_log');
db.exec('DELETE FROM validation_runs');
db.exec('DELETE FROM upload_batches');
db.exec('DELETE FROM email_repository');

// Reset SQLite's internal auto-increment counters so new records start at id=1 again
db.exec("DELETE FROM sqlite_sequence WHERE name IN ('email_repository','upload_batches','validation_runs','validation_log')");

console.log('Repository fully reset — all tables cleared.');