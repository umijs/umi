import isEqual from 'lodash/isEqual';
import isPlainObject from 'lodash/isPlainObject';
import uniq from 'lodash/uniq';
import omitBy from 'lodash/omitBy';
import reduce from 'lodash/reduce';
import { IToc } from './common/Toc';

export const getInitialValue = ({ value, default: defaultValue }, merged = true) => {
  if (isPlainObject(value) && isPlainObject(defaultValue)) {
    return merged
      ? {
          ...defaultValue,
          ...value,
        }
      : defaultValue;
  }
  if (Array.isArray(value) && Array.isArray(defaultValue)) {
    return uniq(defaultValue.concat(value));
  }
  return value || defaultValue;
};

/**
 * useDefaultValue 为 true 时，会将 values 与 default 进行合并
 */
export const arrayToObject = (arr, merged = true) => {
  return (arr || []).reduce(
    (prev, curr) => ({
      ...prev,
      [curr.name]: getInitialValue(
        {
          value: curr.value,
          default: curr.default,
        },
        merged,
      ),
    }),
    {},
  );
};

export const getChangedDiff = (prev: object, curr: object): object =>
  omitBy(curr, (v, k) => isEqual(prev[k], v));

/**
 *
 * @param curr { targets: { a: 1, b: 2 }, outputPath: './public' }
 * @param prev { targets: { a: 1 }, outputPath: './dist' }
 * @returns { targets: { b: 2 }, outputPath: './public' }
 */
export const getDiffItems = (curr, prev) => {
  return reduce(
    curr,
    (result, value, key) => {
      if (isPlainObject(value)) {
        if (!isEqual(value, prev[key])) {
          result[key] = getDiffItems(value, prev[key]);
        }
      } else if (!isEqual(value, prev[key])) {
        result[key] = value;
      }
      return result;
    },
    {},
  );
};

interface IGroup {
  [K: string]: any[];
}

export const getFormItemShow = (name: string) => {
  const configs = name.split('.');
  const parentConfig = configs.length > 1 ? configs[0] : '';
  return {
    parentConfig,
  };
};

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
