import * as React from 'react';
import cls from 'classnames';
import { getHistory, listenMessage } from '@/services/logs';

import styles from './index.less';

const { useState, useEffect, useReducer } = React;

interface LogsProps {}

const Logs: React.SFC<LogsProps> = props => {
  const [logs, dispatch] = useReducer((state, action) => {
    if (action.type === 'add') {
      return [...state, action.payload];
    }
    if (action.type === 'setHistory') {
      return action.payload;
    }
  }, []);

  useEffect(() => {
    (async () => {
      const { data: historyLogs } = await getHistory();
      dispatch({
        type: 'setHistory',
        payload: historyLogs,
      });
      listenMessage({
        onMessage(log) {
          dispatch({
            type: 'add',
            payload: log,
          });
        },
      });
    })();
  }, []);
  console.log('logs', logs);
  return (
    <ul>
      {logs.map((log, i) => {
        return (
          <li key={`${i}`}>
            [{log.type}] [{log.date}] {log.message}
          </li>
        );
      })}
    </ul>
  );
};

export default Logs;
