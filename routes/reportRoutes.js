const express = require('express');
const router = express.Router();
const { categoryReport, monthlyReport, summary } = require('../controllers/reportController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/category', categoryReport);
router.get('/monthly', monthlyReport);
router.get('/summary', summary);

module.exports = router;
