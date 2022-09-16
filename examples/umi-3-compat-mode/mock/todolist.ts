import { defineMock } from 'umi';

export default defineMock({
  '/api/todos': (req, res) => {
    setTimeout(() => {
      res.json({
        success: true,
        dataX: [
          { text: 'read book' },
          { text: 'learn rust' },
          { text: 'eat lunch' },
        ],
      });
    }, 1000);
  },
});
