const express = require('express');
const router = express.Router();
const { getExpenses, addExpense, updateExpense, deleteExpense } = require('../controllers/expenseController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware); // All expense routes require auth

router.get('/', getExpenses);
router.post('/', addExpense);
router.put('/:id', updateExpense);
router.delete('/:id', deleteExpense);

module.exports = router;
