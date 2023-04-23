export default {
  'GET /api'(req: any, res: any) {
    const { delay, title } = req.query;
    setTimeout(() => {
      res.json({
        title,
        delay,
      });
    }, delay);
  },
};
