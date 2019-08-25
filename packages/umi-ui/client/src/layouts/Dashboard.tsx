import { Icon, Menu, Layout, Dropdown } from 'antd';
import { Left, CaretDown } from '@ant-design/icons';
import TweenOne from 'rc-tween-one';
import React, { useState, useEffect, useContext } from 'react';
import get from 'lodash/get';
import { NavLink, withRouter } from 'umi';
import { setCurrentProject, openInEditor } from '@/services/project';
import { handleBack } from '@/utils';
import Context from './Context';
import UiLayout from './Layout';
import styles from './Dashboard.less';

const { Content, Sider } = Layout;
const { TweenOneGroup } = TweenOne;

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

  const projectMaps = window.g_uiProjects || {};
  console.log('projectsprojects', projectMaps);

  const changeProject = async ({ key }) => {
    if (key) {
      await setCurrentProject({
        key,
      });
    }
  };

  return (
    <UiLayout type="detail">
      <Context.Consumer>
        {({ FormattedMessage, formatMessage, currentProject, theme }) => {
          const openEditor = async () => {
            if (currentProject && currentProject.key) {
              await openInEditor({
                key: currentProject.key,
              });
            }
          };

          const recentMenu = (
            <Menu theme={theme} className={styles['sidebar-recentMenu']}>
              <Menu.Item key="openInEdit" onClick={openEditor}>
                <p>在编辑器打开</p>
              </Menu.Item>
              {Object.keys(projectMaps).length > 0 && <Menu.Divider />}
              <Menu.ItemGroup key="projects" title="最近打开">
                {currentProject &&
                  Object.keys(projectMaps)
                    .filter(p => p !== currentProject.key)
                    .sort(
                      (a, b) =>
                        get(projectMaps, `${b}.opened_at`, new Date('2002').getTime()) -
                        get(projectMaps, `${a}.opened_at`, new Date('2002').getTime()),
                    )
                    .map(project => (
                      <Menu.Item key={project} onClick={changeProject}>
                        <p>{get(projectMaps, `${project}.name`, '未命名')}</p>
                      </Menu.Item>
                    ))}
              </Menu.ItemGroup>
            </Menu>
          );

          return (
            <Layout className={styles.normal}>
              <div className={styles.wrapper}>
                <Sider className={styles.sidebar}>
                  <div className={styles['sidebar-name']}>
                    <Left
                      onClick={() => handleBack(false)}
                      className={styles['sidebar-name-back']}
                    />
                    <Dropdown
                      placement="bottomRight"
                      trigger={['click']}
                      overlay={recentMenu}
                      className={styles['sidebar-name-dropdown']}
                    >
                      <div>
                        <p>{currentProject ? currentProject.name : ''}</p>
                        <CaretDown className={styles['sidebar-name-expand-icon']} />
                      </div>
                    </Dropdown>
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
                      const icon =
                        typeof panel.icon === 'object' ? panel.icon : { type: panel.icon };
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
                  <TweenOneGroup
                    enter={{ y: 15, type: 'from', opacity: 0 }}
                    leave={{ y: 15, opacity: 0 }}
                    className={styles['ui-dashboard-transition']}
                  >
                    {/* key pathname change transition will crash  */}
                    <div key={activePanel.path || '/'} className={styles.content}>
                      {props.children}
                    </div>
                  </TweenOneGroup>
                </Content>
              </div>
            </Layout>
          );
        }}
      </Context.Consumer>
    </UiLayout>
  );
});
