const dns = require('dns').promises;

const DNS_TIMEOUT_MS = 3500;

// Use a dedicated DNS resolver instead of the Windows/network DNS server.
// The current network DNS server is refusing/timing out on MX queries.
const resolver = new dns.Resolver();
resolver.setServers(['8.8.8.8', '8.8.4.4']);

function timeout(ms) {
  return new Promise((_, reject) =>
    setTimeout(() => reject(new Error('TIMEOUT')), ms)
  );
}

async function checkMxRecords(domain) {
  try {
    const mxRecords = await Promise.race([
      resolver.resolveMx(domain),
      timeout(DNS_TIMEOUT_MS),
    ]);

    if (mxRecords && mxRecords.length > 0) {
      return {
        outcome: 'has_mx',
        mxRecords,
      };
    }

    // No MX records — try A record fallback (RFC 5321 §5.1 permits this)
    try {
      const aRecords = await Promise.race([
        resolver.resolve4(domain),
        timeout(DNS_TIMEOUT_MS),
      ]);

      return aRecords && aRecords.length > 0
        ? { outcome: 'has_a_fallback', mxRecords: [] }
        : { outcome: 'no_records', mxRecords: [] };
    } catch {
      return { outcome: 'no_records', mxRecords: [] };
    }
  } catch (err) {
    if (err.message === 'TIMEOUT') {
      return { outcome: 'timeout', mxRecords: [] };
    }

    if (err.code === 'ENOTFOUND' || err.code === 'ENODATA') {
      return {
        outcome: 'domain_not_found',
        mxRecords: [],
      };
    }

    return {
      outcome: 'dns_error',
      mxRecords: [],
      errorCode: err.code,
    };
  }
}

module.exports = { checkMxRecords };