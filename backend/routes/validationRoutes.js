const express = require('express');
const router = express.Router();

const {
  runValidation,
  getValidationLogs
} = require('../controllers/validationController');

router.post('/validate/run', runValidation);

router.get('/validation/log', getValidationLogs);

module.exports = router;