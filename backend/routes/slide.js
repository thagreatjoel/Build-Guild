const express = require('express');
const router = express.Router();

const slide = require('../utils/slideController');

router.get('/events', slide.events);
router.get('/next', slide.next);
router.get('/prev', slide.prev);

module.exports = router;
