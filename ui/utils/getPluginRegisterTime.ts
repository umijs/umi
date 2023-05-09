import type { IPlugin } from '@/hooks/useAppData';

export const getRegisterTime = (plugin: IPlugin) => {
  const {
    time: { hooks, register },
  } = plugin;
  const hooksTimeMap: Record<string, number> = {
    register,
  };
  const hooksTime = Object.keys(hooks).reduce((acc, k) => {
    const timeList = hooks[k];
    const t = timeList.reduce((total, t) => total + t);
    if (t > 0) {
      hooksTimeMap[k] = t;
    }
    return acc + t;
  }, 0);

  return {
    totalTime: hooksTime + register,
    detail: hooksTimeMap,
  };
};
