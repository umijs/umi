import React from 'react';
import cls from 'classnames';
import Masonry from 'react-masonry-component';
import isPlainObject from 'lodash/isPlainObject';
import { Card, Row, Col, Avatar, Spin } from 'antd';
import Context from './context';
import styles from './index.module.less';

const { useCallback, useEffect } = React;

export const renderAvatar = (item, isMini = false) => {
  const { icon, title, backgroundColor = '#459BF7' } = item;
  const commonAvatarProps = {
    style: { backgroundColor },
    shape: 'square',
    className: styles.avatar,
    size: isMini ? 'small' : 'default',
  };
  if (React.isValidElement(icon)) {
    return <Avatar {...commonAvatarProps} icon={icon} />;
  }
  if (typeof icon === 'string') {
    return <Avatar {...commonAvatarProps} src={icon} />;
  }
  if (isPlainObject(icon)) {
    return <Avatar {...commonAvatarProps} {...icon} />;
  }
  // 默认返回 title 第一个字符
  const defaultChar = typeof title === 'string' ? title.charAt(0) : 'Umi';
  if (defaultChar) {
    return <Avatar {...commonAvatarProps}>{defaultChar}</Avatar>;
  }
};

export const MESSAGES = {
  CHANGE_CARDS: Symbol('CHANGE_CARDS'),
};

const DashboardUI: React.FC<{}> = props => {
  // const isClosed = window.localStorage.getItem('umi_ui_dashboard_welcome') || false;
  // const [closed, setClosed] = useState<boolean>(!!isClosed);
  const { api, loading, dashboardCards, setCardSettings } = React.useContext(Context);
  const { event, currentProject, intl, getBasicUI = () => ({}) } = api;
  const [, updateState] = React.useState();
  const forceUpdate = useCallback(() => updateState({}), []);
  const actionCardCls = cls(styles.card, styles['card-action']);
  const welcomeCardCls = cls(styles.card, styles.welcome);
  const basicUI = getBasicUI();

  const containerCls = cls(styles['container-row'], 'ant-row', 'ant-row-flex');
  const renderCard = content => {
    const childProps = {
      // 用于动态卡片 DidMount 后，重新计算瀑布流
      forceUpdate,
    };
    if (Array.isArray(content)) {
      // 横向排列快捷入口
      return (
        <Row className={styles['content-row']}>
          {React.Children.map(content, (child, i) => (
            <Col
              className={styles['content-col']}
              key={i.toString()}
              span={Math.floor(24 / content.length)}
            >
              {child}
            </Col>
          ))}
        </Row>
      );
    }
    if (React.isValidElement(content)) {
      return React.cloneElement(content, childProps);
    }
  };

  useEffect(() => {
    event.on(MESSAGES.CHANGE_CARDS, setCardSettings);
    return () => {
      event.off(MESSAGES.CHANGE_CARDS, setCardSettings);
    };
  }, []);
  const enableCards = (dashboardCards || []).filter(card => !!card.enable);
  if (loading) {
    return <Spin />;
  }
  const colCls = cls(actionCardCls, styles['container-col']);

  return (
    <div className={styles.container}>
      <Masonry className={containerCls}>
        <div className={colCls}>
          <Card className={welcomeCardCls} bordered={false} hoverable={false}>
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
              <a
                href="https://umijs.org/guide/umi-ui.html"
                target="_blank"
                rel="noopener noreferrer"
              >
                {basicUI.name || 'Umi'} UI
              </a>
              {intl({ id: 'org.umi.ui.dashboard.panel.welcome.desc' })}
            </div>
          </Card>
        </div>
        {enableCards.map(card => {
          const { title = '', description, key, content, right, colClassName } = card;
          const Title = (
            <Row className={styles.main} gutter={16} align="top" justify="space-between">
              <Col className={styles['main-col']}>
                <div className={cls(styles.icon)}>{renderAvatar(card, api.mini)}</div>
                <div className={styles.info}>
                  <h4>{title}</h4>
                  {description && <p>{description}</p>}
                </div>
              </Col>
              {right && <div className={styles.right}>{right}</div>}
            </Row>
          );
          const cardColCls = cls(colCls, colClassName);
          return (
            <div key={key} className={cardColCls}>
              <Card title={Title} className={styles.card} bordered={false} hoverable={false}>
                {renderCard(content)}
              </Card>
            </div>
          );
        })}
      </Masonry>
    </div>
  );
};

export default DashboardUI;
