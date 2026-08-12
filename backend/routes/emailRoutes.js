const express = require('express');
const router = express.Router();
const { getAllEmails, getDashboardStats } = require('../controllers/emailController');

router.get('/emails', getAllEmails);
router.get('/dashboard', getDashboardStats);

module.exports = router;