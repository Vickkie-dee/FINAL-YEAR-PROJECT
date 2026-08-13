const db = require('../db/dbConnection');
const { DISPOSABLE_DOMAINS } = require('../utils/disposableDomains');
const { ROLE_PREFIXES } = require('../utils/rolePrefixes');

const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/;

function checkSyntax(email) {
  const isValid = EMAIL_REGEX.test(email);
  return { pass: isValid, detail: isValid ? 'Valid syntax' : 'Failed RFC 5322 pattern match' };
}

function checkDuplicate(emailRecord) {
  const existing = db.prepare(`
    SELECT id FROM email_repository
    WHERE email_normalized = ? AND id != ? AND status != 'unvalidated'
  `).get(emailRecord.email_normalized, emailRecord.id);

  return existing
    ? { isDuplicate: true, detail: `Duplicate of record id ${existing.id}` }
    : { isDuplicate: false, detail: 'No duplicate found' };
}

function checkStaticClassification(emailRecord) {
  const isRoleBased = ROLE_PREFIXES.includes(emailRecord.local_part.toLowerCase());
  const isDisposable = DISPOSABLE_DOMAINS.includes(emailRecord.domain.toLowerCase());

  return { isRoleBased, isDisposable };
}

module.exports = { checkSyntax, checkDuplicate, checkStaticClassification, EMAIL_REGEX };