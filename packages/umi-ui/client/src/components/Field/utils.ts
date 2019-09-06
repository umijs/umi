import { ICompProps } from './index';

export const getFormItemShow = (name: string) => {
  const configs = name.split('.');
  const parentConfig = configs.length > 1 ? configs[0] : '';
  return {
    parentConfig,
  };
};
