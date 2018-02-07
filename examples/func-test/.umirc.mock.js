export default {
  '/api/hello'(req, res) {
    res.end(`hello ${Math.random()}`);
  },
};
