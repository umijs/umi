import React from 'react';
import { Icon } from 'antd';
import { formatMessage, FormattedMessage, getLocale, setLocale } from 'umi-plugin-locale';
import { IUi } from 'umi-types';
import Context from './Context';
import Terminal from '@/components/Terminal';
import styles from './Layout.less';
import { PROJECT_STATUS, IProjectStatus, LOCALES } from '@/enums';

interface IProjectProps {}

interface IProjectState {
  /** current step in project */
  current: IProjectStatus;
}

class Layout extends React.Component<IProjectProps, IProjectState> {
  onLocaleChange = (value: IUi.ILang) => {
    setLocale(value);
  };
  render() {
    const locale = getLocale();
    window.g_uiContext = Context;

    return (
      <Context.Provider
        value={{
          locale,
          formatMessage,
          setLocale,
          FormattedMessage,
        }}
      >
        {this.props.children}
        <div className={styles.footer}>
          <Terminal />
          <div className={styles.statusBar}>
            <div className={styles.section}>
              <Icon type="folder" /> 当前位置
            </div>
            <div className={`${styles.section} ${styles.action} ${styles.log}`}>
              <Icon type="profile" /> 日志
            </div>
            <div className={styles.section}>
              <Icon type="bug" /> bbb
            </div>
          </div>
        </div>
      </Context.Provider>
    );
  }
}

export default Layout;
