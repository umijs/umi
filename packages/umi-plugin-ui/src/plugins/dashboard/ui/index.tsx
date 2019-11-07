import React from 'react';
import cls from 'classnames';
import Masonry from 'react-masonry-component';
import { Smile } from '@ant-design/icons';
import { Card, Row, Col, Avatar } from 'antd';
import Context from './context';
import styles from './index.module.less';

const { useState, useRef, useEffect } = React;

const DashboardUI: React.FC<{}> = props => {
  const isClosed = window.localStorage.getItem('umi_ui_dashboard_welcome') || false;
  const [closed, setClosed] = useState<boolean>(!!isClosed);
  const { api } = React.useContext(Context);
  const { redirect, currentProject, intl, getBasicUI = () => ({}), getDashboard } = api;
  const { FormattedMessage } = intl;
  const actionCardCls = cls(styles.card, styles['card-action']);
  const welcomeCardCls = cls(styles.card, styles.welcome);
  const basicUI = getBasicUI();
  const dashboardCards = getDashboard();
  console.log('dashboardCards', dashboardCards);

  const actionCards = [
    {
      className: actionCardCls,
      title: (
        <div className={styles.main}>
          <div className={cls(styles.icon)} />
          <div className={styles.info}>
            <h4>{intl({ id: 'org.umi.ui.dashboard.panel.dev.title' })}</h4>
            <p>{intl({ id: 'org.umi.ui.dashboard.panel.dev.desc' })}</p>
          </div>
        </div>
      ),
      body: (
        <div onClick={() => redirect('/tasks')}>
          <FormattedMessage id="org.umi.ui.dashboard.panel.goto.task" />
        </div>
      ),
    },
    {
      className: actionCardCls,
      title: (
        <div className={styles.main}>
          <div className={cls(styles.icon, styles.build)} />
          <div className={styles.info}>
            <h4>{intl({ id: 'org.umi.ui.dashboard.panel.build.title' })}</h4>
            <p>{intl({ id: 'org.umi.ui.dashboard.panel.build.desc' })}</p>
          </div>
        </div>
      ),
      body: (
        <div onClick={() => redirect('/tasks?active=build')}>
          {intl({ id: 'org.umi.ui.dashboard.panel.goto.task' })}
        </div>
      ),
    },
    // {
    //   className: actionCardCls,
    //   title: (
    //     <div className={styles.future}>
    //       <div>
    //         <Smile />
    //       </div>
    //       <p>{intl({ id: 'org.umi.ui.dashboard.panel.coming.soon' })}</p>
    //     </div>
    //   ),
    // },
  ];

  if (!closed) {
    actionCards.unshift({
      className: welcomeCardCls,
      size: 'small',
      // extra: <Close className={styles.close} onClick={handleClose} />,
      body: (
        <div>
          <h2>Hi</h2>
          <p>
            {intl(
              {
                id: 'org.umi.ui.dashboard.panel.welcome.title',
              },
              {
                name: currentProject.name,
              },
            )}
          </p>
          <div>
            <a href="https://umijs.org/guide/umi-ui.html" target="_blank" rel="noopener noreferrer">
              {basicUI.name || 'Umi'} UI
            </a>
            {intl({ id: 'org.umi.ui.dashboard.panel.welcome.desc' })}
          </div>
        </div>
      ),
    });
  }
  const containerCls = cls(styles['container-row'], 'ant-row', 'ant-row-flex');
  const renderCard = content => {
    if (Array.isArray(content)) {
      // 横向排列快捷入口
      return (
        <Row className={styles['content-row']} type="flex">
          {React.Children.map(content, (child, i) => (
            <Col
              className={styles['content-col']}
              key={i.toString()}
              span={Math.floor(24 / content.length)}
            >
              {renderCard(child)}
            </Col>
          ))}
        </Row>
      );
    }
    if (React.isValidElement(content)) {
      return content;
    }
  };

  const renderAvatar = (icon, defaultChar) => {
    const commonAvatarProps = {
      style: { backgroundColor: '#459BF7' },
      shape: 'square',
      className: styles.avatar,
    };
    if (React.isValidElement(icon)) {
      return <Avatar {...commonAvatarProps} icon={icon} />;
    }
    if (typeof icon === 'string') {
      return <Avatar {...commonAvatarProps} src={icon} />;
    }
    // 默认返回 title 第一个字符
    if (defaultChar) {
      return <Avatar {...commonAvatarProps}>{defaultChar}</Avatar>;
    }
  };

  return (
    <div className={styles.container}>
      <Masonry className={containerCls}>
        {dashboardCards.map((card, i) => {
          const defaultSpan = {
            xs: 24,
            sm: 12,
            lg: 12,
            xl: 6,
          };
          const { title = '', description, content, icon, span = defaultSpan } = card;
          const colCls = cls(actionCardCls, styles['container-col']);
          const Title = (
            <div className={styles.main}>
              <div className={cls(styles.icon)}>{renderAvatar(icon, title.charAt(0))}</div>
              <div className={styles.info}>
                <h4>{title}</h4>
                <p>{description}</p>
              </div>
            </div>
          );
          const colSpan = api._.isPlainObject(span) ? { ...defaultSpan, ...span } : { span };
          return (
            <Col key={i.toString()} className={colCls} {...colSpan}>
              <Card title={Title} className={styles.card} bordered={false} hoverable={false}>
                {renderCard(content)}
              </Card>
            </Col>
          );
        })}
      </Masonry>
    </div>
  );
};

export default DashboardUI;
