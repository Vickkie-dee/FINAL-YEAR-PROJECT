const db = require('./db/dbConnection');

db.prepare(`
  UPDATE email_repository
  SET
    status = 'unvalidated',
    failure_reason = NULL,
    is_role_based = 0,
    is_disposable = 0,
    mx_records = NULL,
    last_validated_at = NULL
`).run();

console.log('Test email records reset to unvalidated.');

db.close();