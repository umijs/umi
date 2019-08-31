import { ICompProps } from './index';
import { IToc } from '../common/Toc';

export const getFormItemShow = (name: string) => {
  const configs = name.split('.');
  const parentConfig = configs.length > 1 ? configs[0] : '';
  return {
    parentConfig,
  };
};

interface IGroup {
  [K: string]: ICompProps[];
}

export const getToc = (group: IGroup, data: IGroup): IToc[] => {
  return Object.keys(group).reduce((prev, curr) => {
    if (group[curr].length > 0) {
      prev.push({
        href: curr,
        title: curr,
        level: 0,
      });
      (group[curr] || []).forEach(item => {
        const { parentConfig } = getFormItemShow(item.name);
        const parentValue = data[parentConfig];
        const isShow =
          typeof parentValue === 'undefined' || (typeof parentValue === 'boolean' && !!parentValue);
        if (isShow) {
          prev.push({
            href: item.name,
            title: item.title,
            level: 1,
          });
        }
      });
    }
    return prev;
  }, []);
};
