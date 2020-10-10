
export default {
  '/api/a': { a: 1 },
  '/api/users/:userId': { a: 1 },
  'POST /api/a': { a: 1 },
  '/api/b': (req, res) => {
    res.end(JSON.stringify({ b: 1 }));
  },
}
