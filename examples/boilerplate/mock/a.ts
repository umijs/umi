export default {
  '/api/a': { a: 1 },
  'post /api/a'(req: any, res: any) {
    res.json({ id: req.body });
  },
  '/api/users/:userId'(req: any, res: any) {
    res.json({ id: req.params.userId });
  },
};
