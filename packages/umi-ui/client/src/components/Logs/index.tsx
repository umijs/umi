import * as React from 'react';
import { formatDate, formatMessage } from 'umi-plugin-react/locale';
import { getLocale } from '@/utils/index';
import zhCN from '@/locales/zh-CN';
import enUS from '@/locales/en-US';
import Ansi from 'ansi-to-react';
import { Tag } from 'antd';
import cls from 'classnames';

import styles from './index.less';

interface LogProps {
  logs?: object[];
  style?: React.CSSProperties;
  className?: string;
  type?: string;
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

  // const formatDate = moment(date).isValid() ? moment(date).format('YYYY-MM-DD HH:mm:ss') : '';
  const messageGroup = message.split('\n');
  return (
    <li className={styles.log}>
      <Tag className={styles['log-tag']} {...TAG_MAP[type]}>
        {typeof type === 'string' ? type.toLocaleUpperCase() : 'UNKNOW'}
      </Tag>
      <p className={styles['log-date']}>
        {formatDate(date, {
          year: 'numeric',
          month: 'numeric',
          day: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
          second: 'numeric',
        })}
        &nbsp;&nbsp;
      </p>
      <div className={styles['log-desc']}>
        {messageGroup.map((msg, i) => (
          <p key={i.toString()}>
            <Ansi key={i.toString()} linkify>
              {msg}
            </Ansi>
          </p>
        ))}
      </div>
    </li>
  );
};

const Logs: React.SFC<LogProps> = props => {
  const { logs, style, className, type } = props;
  const logsCls = cls(styles.logs, className);
  const localeMessages = getLocale() === 'zh-CN' ? zhCN : enUS;

  return (
    <div className={logsCls} style={style}>
      <ul id="ui-footer-logs">
        {Array.isArray(logs) && logs.length > 0 ? (
          logs.map((log, i) => <Log {...log} key={i} />)
        ) : (
          <li>
            {type === 'loading'
              ? localeMessages['org.umi.ui.global.log.empty']
              : formatMessage({ id: 'org.umi.ui.global.log.empty' })}
          </li>
        )}
      </ul>
    </div>
  );
};

export default Logs;
