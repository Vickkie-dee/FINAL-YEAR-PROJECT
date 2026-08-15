const db = require('../db/dbConnection');
const { runValidationPipeline } = require('../services/pipelineOrchestrator');

async function runValidation(req, res) {
  try {
    const result = await runValidationPipeline(req.userId);
    res.json(result);
  } catch (err) {
    res.status(500).json({
      error: 'Validation pipeline failed',
      detail: err.message
    });
  }
}

function getValidationLogs(req, res) {
  try {
    const logs = db.prepare(`
      SELECT
        vl.id,
        vl.email_id,
        er.email,
        vl.run_id,
        vl.stage,
        vl.result,
        vl.detail,
        vl.duration_ms,
        vl.logged_at
      FROM validation_log vl
      JOIN email_repository er
        ON er.id = vl.email_id
      WHERE er.user_id = ?
      ORDER BY vl.id ASC
    `).all(req.userId);

    res.json(logs);
  } catch (err) {
    res.status(500).json({
      error: 'Failed to retrieve validation logs',
      detail: err.message
    });
  }
}

module.exports = {
  runValidation,
  getValidationLogs
};