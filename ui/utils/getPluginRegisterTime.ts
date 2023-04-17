import type { IPlugin } from '@/hooks/useAppData';

export const getRegisterTime = (plugin: IPlugin) => {
  const {
    time: { hooks, register },
  } = plugin;
  const hooksTime = Object.keys(hooks).reduce((acc, k) => {
    const timeList = hooks[k];
    return acc + timeList.reduce((total, t) => total + t);
  }, 0);

  return hooksTime + register;
};
