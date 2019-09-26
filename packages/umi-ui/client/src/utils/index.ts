import get from 'lodash/get';
import history from '@tmp/history';
import { IUi } from 'umi-types';
import querystring from 'querystring';
import { IProjectList, IProjectItem } from '@/enums';

export const isMiniUI = () => {
  const qs = querystring.parse(window.location.search.slice(1)) || {};
  return 'mini' in qs;
};

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

export const handleBack = (reload = true, url = '/project/select') => {
  return new Promise(resolve => {
    history.push(url);
    if (reload) {
      window.location.reload();
    }
    resolve();
  });
};

interface IProjectListItem extends IProjectItem {
  key: string;
}

export const getProjectStatus = (item: IProjectListItem): 'success' | 'failure' | 'progress' => {
  if (get(item, 'creatingProgress.success')) return 'success';
  if (get(item, 'creatingProgress.failure')) return 'failure';
  if (item.creatingProgress) return 'progress';
  return 'success';
};

interface IListItem extends IUi.ICurrentProject {
  active?: boolean;
  created_at: number | undefined;
}

/**
 *
 * @param list 列表
 * 列表排序：
 * 1. 优先排 active
 * 2. 失败的排最后
 * 3. 最新创建的排前面
 */
export const sortProjectList = (list: IListItem[]): IListItem[] => {
  return list.sort((prev, next) => {
    let prevWeight = 0;
    let nextWeight = 0;
    if (prev.active) {
      prevWeight += Number.MAX_VALUE;
    }
    if (next.active) {
      nextWeight += Number.MAX_VALUE;
    }
    if (prev.created_at) {
      prevWeight += prev.created_at;
    }
    if (next.created_at) {
      nextWeight += next.created_at;
    }
    const prevStatus = getProjectStatus(prev as any);
    const nextStatus = getProjectStatus(next as any);
    if (prevStatus === 'failure') {
      prevWeight += Number.MIN_SAFE_INTEGER;
    }
    if (nextStatus === 'failure') {
      nextWeight += Number.MIN_SAFE_INTEGER;
    }

    return nextWeight - prevWeight;
  });
};
