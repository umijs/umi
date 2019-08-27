import React from 'react';
import { Spin } from 'antd';
import { getLocale } from 'umi-plugin-react/locale';
import nprogress from 'nprogress';
import styles from './Loading.less';

const { useEffect } = React;

nprogress.configure({
  showSpinner: false,
  minimum: 0.3,
});

const messages = {
  'zh-CN': {
    'org.umi.ui.loading.open': '加载中',
  },
  'en-US': {
    'org.umi.ui.loading.open': 'Loading',
  },
};

const PageLoading: React.SFC<{}> = () => {
  const locale = getLocale();
  const message = messages[locale];

  useEffect(() => {
    nprogress.start();
    return () => {
      nprogress.done();
    };
  }, []);

  return (
    <div className={styles.loading}>
      <div className={styles['loading-spin']}>
        <Spin size="large" />
        <p>{message['org.umi.ui.loading.open']}</p>
      </div>
    </div>
  );
};

export default PageLoading;
