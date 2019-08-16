export const getFormItemShow = (name: string, form) => {
  const configs = name.split('.');
  const parentConfig = configs.length > 1 ? configs[0] : '';
  console.log('parentConfig11', parentConfig);
  return {
    parentConfig,
  };
};
