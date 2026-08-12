const express = require('express');
const multer = require('multer');
const router = express.Router();
const { uploadCsv } = require('../controllers/uploadController');

const upload = multer({ dest: 'uploads/' });

router.post('/upload', upload.single('file'), uploadCsv);

module.exports = router;