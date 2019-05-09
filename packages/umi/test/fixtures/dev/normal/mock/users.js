export default {
  'GET /api/users': (req, res) => {
    res.json({ name: require('@/cc').default });
  },
  'POST /api/users': (req, res) => {
    res.json({
      body: req.body,
    });
  },
  'PUT /api/users': (req, res) => {
    res.json({
      body: req.body,
    });
  },
  'PATCH /api/users': (req, res) => {
    res.json({
      body: req.body,
    });
  },
  'DELETE /api/users': (req, res) => {
    res.json({
      body: req.body,
    });
  },
  'GET /api/proxytest': { data: 'proxytest' },
  'GET /api/proxytest1': { data: 'proxytest1' },
};
