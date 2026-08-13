const express = require('express');
const router = express.Router();
const { getAllEmails, getDashboardStats, addSingleEmail } = require('../controllers/emailController');

router.get('/emails', getAllEmails);
router.get('/dashboard', getDashboardStats);
router.post('/emails', addSingleEmail);

module.exports = router;