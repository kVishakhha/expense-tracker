const { pool } = require('../config/db');

// GET /api/reports/category
const categoryReport = async (req, res) => {
  const userId = req.user.id;
  const { year, month } = req.query;

  let conditions = ['user_id = $1'];
  let params = [userId];
  let idx = 2;

  if (year) {
    conditions.push(`EXTRACT(YEAR FROM date) = $${idx++}`);
    params.push(year);
  }
  if (month) {
    conditions.push(`EXTRACT(MONTH FROM date) = $${idx++}`);
    params.push(month);
  }

  const where = conditions.join(' AND ');

  try {
    const result = await pool.query(
      `SELECT category, SUM(amount) AS total, COUNT(*) AS count
       FROM expenses WHERE ${where}
       GROUP BY category ORDER BY total DESC`,
      params
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
};

// GET /api/reports/monthly
const monthlyReport = async (req, res) => {
  const userId = req.user.id;
  const { year } = req.query;

  let conditions = ['user_id = $1'];
  let params = [userId];

  if (year) {
    conditions.push(`EXTRACT(YEAR FROM date) = $2`);
    params.push(year);
  }

  const where = conditions.join(' AND ');

  try {
    const result = await pool.query(
      `SELECT TO_CHAR(DATE_TRUNC('month', date), 'YYYY-MM') AS month,
              SUM(amount) AS total, COUNT(*) AS count
       FROM expenses WHERE ${where}
       GROUP BY month ORDER BY month DESC`,
      params
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
};

// GET /api/reports/summary
const summary = async (req, res) => {
  const userId = req.user.id;

  try {
    const [totalResult, monthResult, countResult] = await Promise.all([
      pool.query('SELECT SUM(amount) AS total FROM expenses WHERE user_id=$1', [userId]),
      pool.query(
        `SELECT SUM(amount) AS monthly_total FROM expenses
         WHERE user_id=$1 AND DATE_TRUNC('month', date) = DATE_TRUNC('month', NOW())`,
        [userId]
      ),
      pool.query('SELECT COUNT(*) AS count FROM expenses WHERE user_id=$1', [userId]),
    ]);

    res.json({
      total_all_time: totalResult.rows[0].total || 0,
      total_this_month: monthResult.rows[0].monthly_total || 0,
      total_transactions: countResult.rows[0].count,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error.' });
  }
};

module.exports = { categoryReport, monthlyReport, summary };
