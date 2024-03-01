export default {
  proxy: {
    '/events/': {
      target: 'http://localhost:3000',
    },
  },
};
