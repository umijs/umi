import path from 'path';

export default {
  mpa: {
    template: 'templates/default.html',
    getConfigFromEntryFile: true,
    layout: '@/layouts/basic',
  },
  alias: {
    '@/shared': path.join(__dirname, '../shared'),
  },
};
