const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
    const token = jwt.sign({ admin: true }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.json({ token });
  } else {
    res.status(401).json({ msg: 'Invalid credentials' });
  }
});

module.exports = router;
