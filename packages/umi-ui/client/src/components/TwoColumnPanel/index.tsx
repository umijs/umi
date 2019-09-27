import React, { useState, useEffect } from 'react';
import { IUi } from 'umi-types';
import get from 'lodash/get';
import { Icon } from '@ant-design/compatible';
import cls from 'classnames';
import { Row, Col } from 'antd';
import { formatMessage } from 'umi-plugin-react/locale';
import { stringify, parse } from 'qs';
import history from '@tmp/history';
import styles from './index.less';

const TwoColumnPanel: React.FC<IUi.ITwoColumnPanel> = props => {
  const { sections, disableRightOverflow = false, disableLeftOverflow = false, className } = props;

  const { pathname } = history.location;

  const queryParams = parse(window.location.search, { ignoreQueryPrefix: true });
  const { active } = queryParams;

  const defaultKey = sections.find(section => section.key === active)
    ? active
    : get(sections, '0.key');

  const [current, setCurrent] = useState(defaultKey);

  const toggleSectionHandler = key => {
    setCurrent(key);
    if (key !== current) {
      const search = stringify({
        ...queryParams,
        active: key,
      });
      history.push(`${pathname}?${search}`);
    }
  };

  const leftCls = cls(styles.left, {
    [styles['left-scroll']]: !disableLeftOverflow,
  });
  const rightCls = cls(styles.right, {
    [styles['right-scroll']]: !disableRightOverflow,
  });

  const panelCls = cls(styles.normal, className);

  const currentSection = sections.find(section => section.key === current) || sections[0];
  const children = get(currentSection, 'component');

  return (
    <div className={panelCls}>
      <div className={leftCls} id="two-column-panel-left">
        {sections.map(s => {
          const triggerCls = cls({
            [styles.trigger]: true,
            [styles.triggerActive]: s.key === current,
          });
          return (
            <Row
              className={triggerCls}
              key={s.key}
              type="flex"
              onClick={() => toggleSectionHandler(s.key)}
            >
              <Col className={styles.icon}>
                {typeof s.icon === 'string' && <Icon type={s.icon} width={64} height={64} />}
                {React.isValidElement(s.icon) && s.icon}
              </Col>
              <Col className={styles.title_desc}>
                {s.title && (
                  <div className={styles.title}>
                    {formatMessage({
                      id: s.title,
                    })}
                  </div>
                )}
                {s.description && (
                  <div className={styles.description}>
                    {formatMessage({
                      id: s.description,
                    })}
                  </div>
                )}
              </Col>
            </Row>
          );
        })}
      </div>
      <div className={rightCls} id="two-column-panel-right">
        {typeof children === 'function' && React.isValidElement(children(props)) && children(props)}
        {React.isValidElement(children) && children}
      </div>
    </div>
  );
};

export default TwoColumnPanel;
