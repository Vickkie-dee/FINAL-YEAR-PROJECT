const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const emailRoutes = require('./routes/emailRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const validationRoutes = require('./routes/validationRoutes');
const { requireUserId } = require('./middleware/userIdentity');

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir);
}

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use('/api', requireUserId);

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

app.use('/api', emailRoutes);
app.use('/api', uploadRoutes);
app.use('/api', validationRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});