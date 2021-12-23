export default {
  'GET /api/users': {
    success: true,
    data: {
      users: [{ name: 'admin' }, { name: 'test' }],
    },
  },
  'GET /api/error': (req, res) => {
    res.json({
      success: false,
      data: {},
      errorMessage: 'Error!',
      showType: 1,
      errorCode: -1,
    });
  },
};
