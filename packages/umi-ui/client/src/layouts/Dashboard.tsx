import { Icon } from '@ant-design/compatible';
import { Menu, Layout, Dropdown, Button, message, Tooltip, Row, Col } from 'antd';
import { LeftOutlined, CaretDownOutlined, ExportOutlined } from '@ant-design/icons';
import { formatMessage, FormattedMessage } from 'umi-plugin-react/locale';
import React, { useState, useLayoutEffect, Fragment } from 'react';
import { IUi } from 'umi-types';
import { stringify, parse } from 'qs';
import cls from 'classnames';
import { NavLink, withRouter } from 'umi';
import { setCurrentProject, openInEditor } from '@/services/project';
import { Redirect } from '@/components/icons';
import { callRemote } from '@/socket';
import { handleBack, getProjectStatus, renderLocale } from '@/utils';
import ErrorBoundary from '@/components/ErrorBoundary';
import Context from './Context';
import events, { MESSAGES } from '@/message';
import UiLayout from './Layout';
import debug from '@/debug';
import styles from './Dashboard.less';
import BetaPlugin from './BetaPlugin';

const { Content, Sider } = Layout;

function getActivePanel(pathname) {
  for (const panel of window.g_service.panels) {
    if (panel.path === pathname) {
      return panel;
    }
  }
  return null;
}

const renderLocaleText = renderLocale(formatMessage);

const DefaultProvider = props => {
  return <div {...props}>{props.children}</div>;
};

export default withRouter(props => {
  const _log = debug.extend('Dashboard');
  const { pathname } = props.location;
  const activePanel = getActivePanel(pathname) ? getActivePanel(pathname) : {};
  const [selectedKeys, setSelectedKeys] = useState([activePanel ? activePanel.path : '/']);
  const [actions, setActionPanel] = useState<IUi.IPanelAction>();

  useLayoutEffect(() => {
    const currPanel = getActivePanel(pathname);
    setSelectedKeys([currPanel ? currPanel.path : '/']);
    setActionPanel(currPanel && currPanel.actions ? currPanel.actions : []);
    const handleActionChange = (actionPanels: IUi.IPanelAction) => {
      setActionPanel(actionPanels);
    };
    events.on(MESSAGES.CHANGE_GLOBAL_ACTION, handleActionChange);

    return () => {
      events.off(MESSAGES.CHANGE_GLOBAL_ACTION, handleActionChange);
    };
  }, [pathname]);

  const projectMaps = window.g_uiProjects || {};
  const { active, iife, type, ...restSearchParams } = parse(window.location.search, {
    ignoreQueryPrefix: true,
  });
  const search = Object.keys(restSearchParams).length > 0 ? `?${stringify(restSearchParams)}` : '';

  _log('projectsprojects', projectMaps);

  const changeProject = async ({ key }) => {
    if (key) {
      await handleBack(true, `/dashboard${search}`);
      await setCurrentProject({
        key,
      });
    }
  };

  const title = activePanel.title ? renderLocaleText({ id: activePanel.title }) : '';
  const { panels } = window.g_service;
  const normalPanels = panels.filter(panel => !panel.beta);
  const betaPanels = panels.filter(panel => panel.beta);
  const Provider = activePanel?.provider || DefaultProvider;
  const { headerTitle = title, path = '/' } = activePanel;

  return (
    <UiLayout type="detail" title={title}>
      <Context.Consumer>
        {({ currentProject, theme, isMini, locale, basicUI }) => {
          const openEditor = async () => {
            if (currentProject && currentProject.key) {
              await openInEditor({
                key: currentProject.key,
              });
            }
          };

          const projects = Object.keys(projectMaps);

          const recentMenu = (
            <Menu theme={theme} className={styles['sidebar-recentMenu']}>
              <Menu.ItemGroup
                key="projects"
                title={
                  projects.length > 1
                    ? formatMessage({ id: 'org.umi.ui.global.panel.recent.open' })
                    : formatMessage({ id: 'org.umi.ui.global.panel.recent.open.empty' })
                }
              >
                {currentProject &&
                  projects
                    .filter(
                      p =>
                        p !== currentProject.key && getProjectStatus(currentProject) === 'success',
                    )
                    .sort(
                      (a, b) =>
                        projectMaps?.[b]?.opened_at?.[new Date('2002').getTime()] -
                        projectMaps?.[a]?.opened_at?.[new Date('2002').getTime()],
                    )
                    .slice(0, 5)
                    .map(project => (
                      <Menu.Item key={project} onClick={changeProject}>
                        <p>{projectMaps?.[project]?.name || '未命名'}</p>
                      </Menu.Item>
                    ))}
              </Menu.ItemGroup>
            </Menu>
          );

          const MenuItem = ({ panel, ...restProps }) => {
            const { renderTitle } = panel;
            const renderIcon = () => {
              const icon = typeof panel.icon === 'string' ? { type: panel.icon } : panel.icon;

              if (typeof icon === 'function' && React.isValidElement(icon())) {
                return icon();
              }
              if (React.isValidElement(icon)) {
                return icon;
              }

              return <Icon {...icon} />;
            };

            const titleText = renderLocaleText(panel.title);
            const titleNode = renderTitle ? renderTitle(titleText) : titleText;

            return (
              <Menu.Item
                key={panel.path}
                {...restProps}
                // amtd MenuItem tooltip show/hide (maybe hack)
                title={null}
                level={isMini && locale === 'zh-CN' ? 2 : 1}
              >
                <NavLink exact to={`${panel.path}${search}`}>
                  {renderIcon()}
                  {isMini ? (
                    <p className={styles.menuText}>{titleNode}</p>
                  ) : (
                    <span className={styles.menuItem}>{titleNode}</span>
                  )}
                </NavLink>
              </Menu.Item>
            );
          };

          const getBetaMenu = () => (
            <Menu selectedKeys={selectedKeys}>
              {betaPanels.map((panel, i) => (
                <MenuItem panel={panel} key={panel.path} />
              ))}
            </Menu>
          );

          const openFullUmiUI = async url => {
            await setCurrentProject({
              key: currentProject.key,
            });
            window.open(url);
          };

          const existHeader = headerTitle || actions?.length > 0;
          const mainCls = cls(styles.main, {
            [styles['main-hide-header']]: !existHeader,
          });

          return (
            <div className={styles.normal}>
              {isMini && (
                <Row
                  type="flex"
                  align="middle"
                  justify="space-between"
                  className={styles['mini-header']}
                >
                  <Col>
                    <p className={styles['mini-header-name']}>{currentProject?.name || ''}</p>
                    <Tooltip title={formatMessage({ id: 'org.umi.ui.global.project.editor.open' })}>
                      <ExportOutlined onClick={openEditor} />
                    </Tooltip>
                  </Col>
                  <Col className={styles.gotoUi}>
                    <a
                      rel="noopener noreferrer"
                      onClick={openFullUmiUI.bind(
                        null,
                        `${window.location.origin}${window.location.pathname}`,
                      )}
                    >
                      <Redirect />
                      <FormattedMessage id="org.umi.ui.global.dashboard.mini.full" />
                    </a>
                  </Col>
                </Row>
              )}
              <Layout className={styles.wrapper}>
                <Sider className={styles.sidebar} collapsed={isMini} collapsedWidth={64}>
                  {/* Projects Switch */}
                  <div className={styles['sidebar-main']}>
                    {!isMini && (
                      <div className={styles['sidebar-name']}>
                        <LeftOutlined
                          onClick={() => handleBack(false)}
                          className={styles['sidebar-name-back']}
                        />
                        <Dropdown
                          placement="bottomRight"
                          trigger={['click']}
                          overlay={recentMenu}
                          className={styles['sidebar-name-dropdown']}
                        >
                          {currentProject?.name?.length > 16 ? (
                            <Tooltip title={currentProject.name}>
                              <p>{currentProject.name}</p>
                              <CaretDownOutlined className={styles['sidebar-name-expand-icon']} />
                            </Tooltip>
                          ) : (
                            <div>
                              <p>{currentProject.name}</p>
                              <CaretDownOutlined className={styles['sidebar-name-expand-icon']} />
                            </div>
                          )}
                        </Dropdown>
                      </div>
                    )}
                    <Menu
                      theme="light"
                      selectedKeys={selectedKeys}
                      onClick={({ key }) => {
                        setSelectedKeys([key]);
                      }}
                      style={{
                        border: 0,
                      }}
                      mode="inline"
                    >
                      {normalPanels.map(panel => (
                        <MenuItem
                          className={styles['sidebar-menu-item']}
                          key={panel.path}
                          panel={panel}
                        />
                      ))}
                    </Menu>
                  </div>
                  <BetaPlugin
                    overlay={getBetaMenu()}
                    search={search}
                    betaPanels={betaPanels}
                    isMini={isMini}
                    selectedKeys={selectedKeys}
                  />
                  {basicUI?.dashboard?.siderFooter}
                </Sider>
                <Content className={mainCls}>
                  <Provider style={{ height: '100%' }}>
                    {existHeader && (
                      <div key="header" className={styles.header}>
                        {headerTitle && <h1>{headerTitle}</h1>}
                        {actions?.length > 0 && (
                          <Row type="flex" className={styles['header-actions']}>
                            {actions.map((panelAction, j) => {
                              if (React.isValidElement(panelAction)) {
                                return <Fragment key={j.toString()}>{panelAction}</Fragment>;
                              }
                              if (
                                typeof panelAction === 'function' &&
                                React.isValidElement(panelAction({}))
                              ) {
                                return <Fragment key={j.toString()}>{panelAction({})}</Fragment>;
                              }
                              const { title, action, onClick, ...btnProps } = panelAction;
                              const handleClick = async () => {
                                // TODO: try catch handler
                                try {
                                  await callRemote(action);
                                  if (onClick) {
                                    onClick();
                                  }
                                } catch (e) {
                                  message.error(e && e.message ? e.message : 'error');
                                }
                              };
                              return (
                                title && (
                                  <Button key={j.toString()} onClick={handleClick} {...btnProps}>
                                    {renderLocaleText({ id: title })}
                                  </Button>
                                )
                              );
                            })}
                          </Row>
                        )}
                      </div>
                    )}
                    {/* key pathname change transition will crash  */}
                    <div key={path} className={styles.content}>
                      <ErrorBoundary className={styles['dashboard-error-boundary']}>
                        {props.children}
                      </ErrorBoundary>
                    </div>
                  </Provider>
                </Content>
              </Layout>
            </div>
          );
        }}
      </Context.Consumer>
    </UiLayout>
  );
});
