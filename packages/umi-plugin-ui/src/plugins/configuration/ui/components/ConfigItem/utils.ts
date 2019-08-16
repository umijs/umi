import { ICompProps } from './index';
import { IToc } from '../common/Toc';

export const getFormItemShow = (name: string, form) => {
  const configs = name.split('.');
  const parentConfig = configs.length > 1 ? configs[0] : '';
  console.log('parentConfig11', parentConfig);
  return {
    parentConfig,
  };
};

interface IGroup {
  [K: string]: ICompProps[];
}

export const getToc = (group: IGroup): IToc[] => {
  return Object.keys(group).reduce((prev, curr) => {
    if (group[curr].length > 0) {
      prev.push({
        href: curr,
        title: curr,
        level: 0,
      });
      (group[curr] || []).forEach(item => {
        prev.push({
          href: item.name,
          title: item.title,
          level: 1,
        });
      });
    }
    return prev;
  }, []);
};
