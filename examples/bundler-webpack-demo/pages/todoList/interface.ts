export type Status = 'pending' | 'completed';
export type Filter = Status | 'all';
export interface ITodoItem {
  description: string;
  status: Status;
  id: number;
}

interface IFilterInfoMap {
  label: string;
  color: string;
}

export const FILTER_INFO_MAP: Record<Filter, IFilterInfoMap> = {
  pending: { label: '未完成', color: '#f50' },
  completed: { label: '已完成', color: '#eee' },
  all: { label: '全部', color: '#87d068' },
};
