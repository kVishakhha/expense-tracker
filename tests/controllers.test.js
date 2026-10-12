const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('node:path');

const dbPath = require.resolve('../config/db');
const authControllerPath = require.resolve('../controllers/authController');
const expenseControllerPath = require.resolve('../controllers/expenseController');
const middlewarePath = require.resolve('../middleware/authMiddleware');

let queries;
require.cache[dbPath] = {
  id: dbPath,
  filename: dbPath,
  loaded: true,
  exports: {
    pool: {
      query: (...args) => {
        queries.push(args);
        return Promise.resolve({ rows: [] });
      },
    },
  },
};

const { signup, login } = require(authControllerPath);
const { addExpense, updateExpense, deleteExpense } = require(expenseControllerPath);
const authMiddleware = require(middlewarePath);

function response() {
  return {
    statusCode: 200,
    body: undefined,
    status(code) { this.statusCode = code; return this; },
    json(body) { this.body = body; return this; },
  };
}

test.beforeEach(() => {
  queries = [];
});

test('signup rejects missing fields without querying the database', async () => {
  const res = response();
  await signup({ body: { name: 'Test' } }, res);
  assert.equal(res.statusCode, 400);
  assert.match(res.body.error, /required/i);
  assert.equal(queries.length, 0);
});

test('signup rejects passwords shorter than six characters', async () => {
  const res = response();
  await signup({ body: { name: 'Test', email: 'test@example.com', password: '123' } }, res);
  assert.equal(res.statusCode, 400);
  assert.match(res.body.error, /at least 6/i);
  assert.equal(queries.length, 0);
});

test('signup rejects an already registered email', async () => {
  queries = [];
  const originalQuery = require.cache[dbPath].exports.pool.query;
  require.cache[dbPath].exports.pool.query = (...args) => {
    queries.push(args);
    return Promise.resolve({ rows: [{ id: 1 }] });
  };
  const res = response();
  await signup({ body: { name: 'Test', email: 'test@example.com', password: 'secure123' } }, res);
  assert.equal(res.statusCode, 409);
  assert.match(res.body.error, /already registered/i);
  assert.equal(queries.length, 1);
  require.cache[dbPath].exports.pool.query = originalQuery;
});

test('login rejects missing credentials without querying the database', async () => {
  const res = response();
  await login({ body: { email: 'test@example.com' } }, res);
  assert.equal(res.statusCode, 400);
  assert.match(res.body.error, /required/i);
  assert.equal(queries.length, 0);
});

test('addExpense rejects invalid amounts before inserting', async () => {
  const res = response();
  await addExpense({
    user: { id: 7 },
    body: { amount: -10, category: 'Food', date: '2026-10-12' },
  }, res);
  assert.equal(res.statusCode, 400);
  assert.match(res.body.error, /positive number/i);
  assert.equal(queries.length, 0);
});

test('updateExpense stops when the expense is not owned by the user', async () => {
  const res = response();
  await updateExpense({
    params: { id: '42' },
    user: { id: 7 },
    body: { description: 'attempted change' },
  }, res);
  assert.equal(res.statusCode, 404);
  assert.match(res.body.error, /not found/i);
  assert.equal(queries.length, 1);
  assert.match(queries[0][0], /SELECT id FROM expenses WHERE id=\$1 AND user_id=\$2/);
  assert.deepEqual(queries[0][1], ['42', 7]);
});

test('deleteExpense only deletes an expense owned by the user', async () => {
  const res = response();
  await deleteExpense({ params: { id: '42' }, user: { id: 7 } }, res);
  assert.equal(res.statusCode, 404);
  assert.match(res.body.error, /not found/i);
  assert.equal(queries.length, 1);
  assert.match(queries[0][0], /DELETE FROM expenses WHERE id=\$1 AND user_id=\$2/);
  assert.deepEqual(queries[0][1], ['42', 7]);
});

test('auth middleware rejects requests without a bearer token', () => {
  const res = response();
  let nextCalled = false;
  authMiddleware({ headers: {} }, res, () => { nextCalled = true; });
  assert.equal(res.statusCode, 401);
  assert.equal(nextCalled, false);
});
