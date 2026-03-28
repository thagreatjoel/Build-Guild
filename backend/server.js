const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');          // ← only one declaration
const path = require('path');
const connectDB = require('./config/db');

dotenv.config();
connectDB();

const app = express();

// CORS configuration – allow requests from your Netlify frontend
app.use(cors({
  origin: ['https://kochiguild.netlify.app', 'http://localhost:3000', 'http://localhost:5000'],
  credentials: true
}));

app.use(express.json());

// Serve static frontend files (if you want Render to serve them)
app.use(express.static(path.join(__dirname, '../frontend/public')));

// API routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));
app.use('/api/admin', require('./routes/admin'));

// Catch-all: serve index.html for any unmatched route (for SPA routing)
app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/public/index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));