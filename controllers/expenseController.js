const { pool } = require('../config/db');

// GET /api/expenses
const getExpenses = async (req, res) => {
  const { category, start_date, end_date, page = 1, limit = 10, sort = 'desc' } = req.query;
  const userId = req.user.id;
  const offset = (page - 1) * limit;
  const order = sort === 'asc' ? 'ASC' : 'DESC';

  let conditions = ['user_id = $1'];
  let params = [userId];
  let idx = 2;

  if (category) {
    conditions.push(`category = $${idx++}`);
    params.push(category);
  }
  if (start_date) {
    conditions.push(`date >= $${idx++}`);
    params.push(start_date);
  }
  if (end_date) {
    conditions.push(`date <= $${idx++}`);
    params.push(end_date);
  }

  const whereClause = conditions.join(' AND ');

  try {
    const countResult = await pool.query(
      `SELECT COUNT(*) FROM expenses WHERE ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count);

    params.push(limit, offset);
    const result = await pool.query(
      `SELECT * FROM expenses WHERE ${whereClause} ORDER BY date ${order} LIMIT $${idx} OFFSET $${idx + 1}`,
      params
    );

    res.json({
      expenses: result.rows,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
};

// POST /api/expenses
const addExpense = async (req, res) => {
  const { amount, category, description, date } = req.body;
  const userId = req.user.id;

  if (!amount || !category || !date)
    return res.status(400).json({ error: 'Amount, category, and date are required.' });

  if (isNaN(amount) || Number(amount) <= 0)
    return res.status(400).json({ error: 'Amount must be a positive number.' });

  try {
    const result = await pool.query(
      'INSERT INTO expenses (user_id, amount, category, description, date) VALUES ($1,$2,$3,$4,$5) RETURNING *',
      [userId, amount, category, description || '', date]
    );
    res.status(201).json({ message: 'Expense added!', expense: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
};

// PUT /api/expenses/:id
const updateExpense = async (req, res) => {
  const { id } = req.params;
  const { amount, category, description, date } = req.body;
  const userId = req.user.id;

  try {
    // Check ownership
    const check = await pool.query('SELECT id FROM expenses WHERE id=$1 AND user_id=$2', [id, userId]);
    if (check.rows.length === 0)
      return res.status(404).json({ error: 'Expense not found.' });

    const result = await pool.query(
      `UPDATE expenses SET amount=COALESCE($1,amount), category=COALESCE($2,category),
       description=COALESCE($3,description), date=COALESCE($4,date)
       WHERE id=$5 AND user_id=$6 RETURNING *`,
      [amount, category, description, date, id, userId]
    );
    res.json({ message: 'Expense updated!', expense: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
};

// DELETE /api/expenses/:id
const deleteExpense = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const result = await pool.query(
      'DELETE FROM expenses WHERE id=$1 AND user_id=$2 RETURNING id',
      [id, userId]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Expense not found.' });

    res.json({ message: 'Expense deleted!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
};

module.exports = { getExpenses, addExpense, updateExpense, deleteExpense };
