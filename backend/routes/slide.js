const express = require('express');
const router = express.Router();

const slide = require('../utils/slideController');

router.get('/next', slide.next);
router.get('/prev', slide.prev);
router.get('/status', slide.status);

module.exports = router;
