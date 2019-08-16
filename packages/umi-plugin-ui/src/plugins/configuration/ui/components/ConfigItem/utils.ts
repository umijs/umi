export const getFormItemShow = (name: string, form) => {
  const configs = name.split('.');
  const parentConfig = configs.length > 1 && configs[0];

  const shouldShow = parentConfig ? !!form.getFieldValue(parentConfig) : true;
  return [shouldShow, parentConfig];
};
