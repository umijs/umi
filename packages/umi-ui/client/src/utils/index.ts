import get from 'lodash/get';
import { IProjectList } from '@/enums';

export const getBasename = (path: string): string => {
  return path
    .split('/')
    .filter(name => name)
    .slice(-1)[0];
};

export const findProjectPath = (data: IProjectList) => {
  const path = get(data, `projectsByKey.${get(data, 'currentProject')}.path`);

  if (!path) {
    // throw new Error('findProjectPath path not existed');
    console.error('findProjectPath path not existed');
  }

  return path;
};
