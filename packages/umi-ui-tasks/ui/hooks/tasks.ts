import { useState, useEffect } from 'react';
import { TaskType } from '@/src/server/core/enums';
import { getTaskDetail } from '../util';

const useTaskDetail = (taskType: TaskType) => {
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState({});
  useEffect(() => {
    (async () => {
      try {
        const { result } = await getTaskDetail(taskType);
        setLoading(false);
        setDetail(result);
      } catch (e) {
        setLoading(false);
      }
    })();
  }, []);
  return {
    loading,
    detail,
  };
};

export { useTaskDetail };
