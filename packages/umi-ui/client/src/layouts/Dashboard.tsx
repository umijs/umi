import { Icon, Menu, Select, Layout } from 'antd';
import React, { useState, useEffect } from 'react';
import { NavLink, withRouter } from 'umi';
import { LOCALES } from '@/enums';
import iconSvg from '@/assets/umi.svg';
import Context from './Context';
import UiLayout from './Layout';
import styles from './Dashboard.less';

const { Content, Sider } = Layout;

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

  useEffect(
    () => {
      const currPanel = getActivePanel(pathname);
      setSelectedKeys([currPanel ? currPanel.path : '/']);
    },
    [pathname],
  );

  return (
    <UiLayout type="detail">
      <Context.Consumer>
        {({ locale, FormattedMessage, formatMessage, setLocale }) => (
          <Layout className={styles.normal}>
            <div className={styles.wrapper}>
              <Sider className={styles.sidebar}>
                <div className={styles.logo}>
                  <img alt="logo" className={styles.logo} src={iconSvg} />
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
                  {window.g_service.panels.map(panel => {
                    const icon = typeof panel.icon === 'object' ? panel.icon : { type: panel.icon };
                    return (
                      <Menu.Item key={panel.path}>
                        <Icon {...icon} />
                        <FormattedMessage id={panel.title} />
                        <NavLink exact to={panel.path}>
                          <FormattedMessage id={panel.title} />
                        </NavLink>
                      </Menu.Item>
                    );
                  })}
                </Menu>
              </Sider>
              <Content className={styles.main}>
                <div className={styles.header}>
                  <h1>{activePanel && formatMessage({ id: activePanel.title })}</h1>
                </div>
                <div className={styles.content}>{props.children}</div>
              </Content>
            </div>
          </Layout>
        )}
      </Context.Consumer>
    </UiLayout>
  );
});
