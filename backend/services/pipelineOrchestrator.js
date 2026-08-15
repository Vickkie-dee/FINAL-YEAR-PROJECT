const db = require('../db/dbConnection');
const { checkSyntax, checkDuplicate, checkStaticClassification } = require('./validationService');
const { checkMxRecords } = require('./dnsValidationService');

function logStage(runId, emailId, stage, result, detail, durationMs) {
  db.prepare(`
    INSERT INTO validation_log (email_id, run_id, stage, result, detail, duration_ms)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(emailId, runId, stage, result, detail, durationMs);
}

function updateEmailStatus(emailId, status, failureReason, extra = {}) {
  db.prepare(`
    UPDATE email_repository
    SET status = ?, failure_reason = ?, is_role_based = ?, is_disposable = ?,
        mx_records = ?, last_validated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    status,
    failureReason || null,
    extra.isRoleBased ? 1 : 0,
    extra.isDisposable ? 1 : 0,
    extra.mxRecords ? JSON.stringify(extra.mxRecords) : null,
    emailId
  );
}

async function validateSingleEmail(emailRecord, runId) {
  const start = Date.now();

  // ---------- STAGE 1: SYNTAX ----------
  const syntax = checkSyntax(emailRecord.email);
  logStage(runId, emailRecord.id, 'syntax', syntax.pass ? 'pass' : 'fail', syntax.detail, Date.now() - start);

  if (!syntax.pass) {
    updateEmailStatus(emailRecord.id, 'invalid', 'bad_syntax');
    return 'invalid';
  }

  // ---------- STAGE 2: DUPLICATE ----------
  const dup = checkDuplicate(emailRecord);
  logStage(runId, emailRecord.id, 'duplicate', dup.isDuplicate ? 'flagged' : 'pass', dup.detail, Date.now() - start);

  if (dup.isDuplicate) {
    updateEmailStatus(emailRecord.id, 'duplicate', 'duplicate_record');
    return 'duplicate';
  }

  // ---------- STAGE 3: STATIC CLASSIFICATION ----------
  const staticCheck = checkStaticClassification(emailRecord);
  logStage(
    runId, emailRecord.id, 'static_classification', 'pass',
    `role_based=${staticCheck.isRoleBased}, disposable=${staticCheck.isDisposable}`,
    Date.now() - start
  );

  if (staticCheck.isDisposable) {
    updateEmailStatus(emailRecord.id, 'risky', 'disposable_domain', staticCheck);
    return 'risky';
  }

  // ---------- STAGE 4: DNS / MX ----------
  const dnsResult = await checkMxRecords(emailRecord.domain);
  logStage(runId, emailRecord.id, 'dns_mx', dnsResult.outcome, JSON.stringify(dnsResult.mxRecords || []), Date.now() - start);

  let finalStatus, failureReason;

  switch (dnsResult.outcome) {
    case 'has_mx':
      finalStatus = staticCheck.isRoleBased ? 'risky' : 'valid';
      failureReason = staticCheck.isRoleBased ? 'role_based' : null;
      break;
    case 'has_a_fallback':
      finalStatus = 'risky';
      failureReason = 'no_mx_fallback_a';
      break;
    case 'timeout':
      finalStatus = 'inconclusive';
      failureReason = 'dns_timeout';
      break;
    case 'domain_not_found':
      finalStatus = 'invalid';
      failureReason = 'domain_not_found';
      break;
    case 'no_records':
      finalStatus = 'invalid';
      failureReason = 'no_mx_record';
      break;
    default:
      finalStatus = 'inconclusive';
      failureReason = 'dns_error';
  }

  updateEmailStatus(emailRecord.id, finalStatus, failureReason, {
    ...staticCheck,
    mxRecords: dnsResult.mxRecords,
  });

  return finalStatus;
}

async function runValidationPipeline(userId) {
  const pendingEmails = db.prepare(`SELECT * FROM email_repository WHERE user_id = ? AND status = 'unvalidated'`).all(userId);

  const runInsert = db.prepare(`
    INSERT INTO validation_runs (user_id, total_processed, status) VALUES (?, 0, 'running')
  `);
  const runId = runInsert.run(userId).lastInsertRowid;

  const counts = { valid: 0, invalid: 0, risky: 0, duplicate: 0, inconclusive: 0 };

  for (const emailRecord of pendingEmails) {
    const result = await validateSingleEmail(emailRecord, runId);
    counts[result] = (counts[result] || 0) + 1;
  }

  db.prepare(`
    UPDATE validation_runs
    SET completed_at = CURRENT_TIMESTAMP, total_processed = ?, valid_count = ?,
        invalid_count = ?, risky_count = ?, duplicate_count = ?, inconclusive_count = ?, status = 'completed'
    WHERE id = ?
  `).run(pendingEmails.length, counts.valid, counts.invalid, counts.risky, counts.duplicate, counts.inconclusive, runId);

  return { runId, totalProcessed: pendingEmails.length, counts };
}

module.exports = { runValidationPipeline };