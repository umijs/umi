export default {
  loader: { '.png': 'dataurl' },
  modifyConfig: async (config) => {
    config.loader['.json'] = 'file';
  }
};
