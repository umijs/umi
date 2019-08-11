import * as React from 'react';
import moment from 'moment';
import { Tag } from 'antd';
import cls from 'classnames';

import styles from './index.less';

const { useState, useEffect } = React;

interface LogProps {
  logs?: object[];
  style?: React.CSSProperties;
  className?: string;
}

const TAG_MAP = {
  error: {
    color: '#f04134',
  },
  info: {
    color: '#1890ff',
  },
};

export const Log = logItem => {
  const { type, date, message } = logItem;

  const formatDate = moment(date).isValid() ? moment(date).format('YYYY-MM-DD HH:mm:ss') : '';
  return (
    <li className={styles.log}>
      <Tag {...TAG_MAP[type]}>{typeof type === 'string' ? type.toLocaleUpperCase() : 'UNKNOW'}</Tag>
      <span>{formatDate}</span>
      <span>: {message}</span>
    </li>
  );
};

const Logs: React.SFC<LogProps> = props => {
  const { logs, style, className } = props;
  const logsCls = cls(styles.logs, className);

  return (
    <div className={logsCls} style={style}>
      <ul>{Array.isArray(logs) && logs.map((log, i) => <Log {...log} key={i} />)}</ul>
    </div>
  );
};

export default Logs;
