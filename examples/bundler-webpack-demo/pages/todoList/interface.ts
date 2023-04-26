export type Status = 'pending' | 'completed';
export type Filter = Status | 'all';
export interface TodoItemProps {
  description: string;
  status: Status;
  id: number;
}

export const FILTER_STR = {
  pending: { label: '未完成', color: '#f50' },
  completed: { label: '已完成', color: '#eee' },
  all: { label: '全部', color: '#87d068' },
} as const;
