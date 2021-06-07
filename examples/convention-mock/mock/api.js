export default {
  // 支持值为 Object 和 Array
  'GET /api/users': {
    users: [
      { id: 1, name: 'ahwgs' },
      { id: 2, name: 'ahwgs2' },
    ],
  },

  // GET 可忽略
  '/api/users/1': { name: 'ahwgs' },

  // 支持自定义函数，API 参考 express@4
  'POST /api/users/create': (req, res) => {
    const { name } = req.body;
    // 添加跨域请求头
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.json({ message: 'success', code: 0, data: { name } });
  },
};
