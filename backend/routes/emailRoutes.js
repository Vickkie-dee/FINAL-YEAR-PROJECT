const express = require('express');
const router = express.Router();
const { getAllEmails, getDashboardStats, addSingleEmail, resetMyRepository } = require('../controllers/emailController');

router.get('/emails', getAllEmails);
router.get('/dashboard', getDashboardStats);
router.post('/emails', addSingleEmail);
router.delete('/emails/reset', resetMyRepository);

module.exports = router;