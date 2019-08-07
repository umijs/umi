import { Icon, Menu, Select } from 'antd';
import React, { useState } from 'react';
import { NavLink, withRouter } from 'umi';
import { LOCALES } from '@/enums';
import Context from './Context';
import Layout from './Layout';
import styles from './Dashboard.less';

function getActivePanel(pathname) {
  for (const panel of window.g_service.panels) {
    if (panel.path === pathname) {
      return panel;
    }
  }
  return null;
}

export default withRouter(props => {
  const { pathname } = props.location;
  const activePanel = getActivePanel(pathname);
  console.log('activePanel.path', activePanel && activePanel.path);
  const [selectedKeys, setSelectedKeys] = useState([activePanel ? activePanel.path : '/']);

  return (
    <Layout>
      <Context.Consumer>
        {({ locale, FormattedMessage, formatMessage, setLocale }) => (
          <div className={styles.normal}>
            <div className={styles.wrapper}>
              <div className={styles.sidebar}>
                <div className={styles.logo}>
                  <img
                    alt="logo"
                    className={styles.logo}
                    src="https://gw.alipayobjects.com/zos/rmsportal/lbZMwLpvYYkvMUiqbWfd.png"
                  />
                  <div>
                    <FormattedMessage id="org.umi.ui.global.panel.lang" />{' '}
                    <Select onChange={setLocale} defaultValue={locale}>
                      {Object.keys(LOCALES).map(lang => (
                        <Select.Option key={lang} value={lang}>
                          {LOCALES[lang]}
                        </Select.Option>
                      ))}
                    </Select>
                  </div>
                </div>
                <Menu
                  selectedKeys={selectedKeys}
                  onClick={({ key }) => {
                    setSelectedKeys([key]);
                  }}
                  style={{
                    border: 0,
                  }}
                >
                  <Menu.Item key="/">
                    <Icon type="home" />
                    <FormattedMessage id="org.umi.ui.global.panel.home" />
                    <NavLink exact to="/dashboard">
                      <FormattedMessage id="org.umi.ui.global.panel.home" />
                    </NavLink>
                  </Menu.Item>
                  {window.g_service.panels.map(panel => {
                    return (
                      <Menu.Item key={panel.path}>
                        <Icon type={panel.icon} />
                        <FormattedMessage id={panel.title} />
                        <NavLink exact to={panel.path}>
                          <FormattedMessage id={panel.title} />
                        </NavLink>
                      </Menu.Item>
                    );
                  })}
                </Menu>
              </div>
              <div className={styles.main}>
                <h1>
                  {activePanel
                    ? formatMessage({ id: activePanel.title })
                    : formatMessage({ id: 'org.umi.ui.global.panel.home' })}
                </h1>
                <div className={styles.content}>{props.children}</div>
              </div>
            </div>
          </div>
        )}
      </Context.Consumer>
    </Layout>
  );
});
