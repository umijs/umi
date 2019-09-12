import React, { useState, useEffect } from 'react';
import { IUi } from 'umi-types';
import { Icon } from '@ant-design/compatible';
import cls from 'classnames';
import { formatMessage } from 'umi-plugin-react/locale';
import history from '@tmp/history';
import styles from './index.less';

const TwoColumnPanel: React.FC<IUi.ITwoColumnPanel> = props => {
  const { sections, disableRightOverflow = false, disableLeftOverflow = false, className } = props;

  const { pathname, query } = history.location;

  const keys = sections.map(({ key }) => key);
  let activeIndex = 0;
  if (query.active) {
    const index = keys.indexOf(query.active);
    activeIndex = index === -1 ? 0 : index;
  }

  const [currentIndex, setCurrentIndex] = useState(activeIndex);

  useEffect(() => {
    setCurrentIndex(activeIndex);
  }, []);

  const Component = sections[currentIndex].component;

  const toggleSectionHandler = index => {
    setCurrentIndex(index);
    if (keys[index] !== query.active) {
      history.push(`${pathname}?active=${keys[index]}`);
    }
  };

  const leftCls = cls(styles.left, {
    [styles['left-scroll']]: !disableLeftOverflow,
  });
  const rightCls = cls(styles.right, {
    [styles['right-scroll']]: !disableRightOverflow,
  });

  const panelCls = cls(styles.normal, className);

  return (
    <div className={panelCls}>
      <div className={leftCls} id="two-column-panel-left">
        {sections.map((s, index) => {
          const triggerCls = cls({
            [styles.trigger]: true,
            [styles.triggerActive]: index === currentIndex,
          });
          return (
            <div className={triggerCls} key={s.title} onClick={() => toggleSectionHandler(index)}>
              <div className={styles.icon}>
                {typeof s.icon === 'string' && <Icon type={s.icon} width={64} height={64} />}
                {React.isValidElement(s.icon) && s.icon}
              </div>
              <div className={styles.title_desc}>
                <div className={styles.title}>
                  {formatMessage({
                    id: s.title,
                  })}
                </div>
                <div className={styles.description}>
                  {formatMessage({
                    id: s.description,
                  })}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className={rightCls} id="two-column-panel-right">
        <Component />
      </div>
    </div>
  );
};

export default TwoColumnPanel;
