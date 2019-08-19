import React, { useState } from 'react';
import { IUi } from 'umi-types';
import { Icon } from 'antd';
import cls from 'classnames';
import styles from './index.less';

const TwoColumnPanel: React.FC<IUi.ITwoColumnPanel> = props => {
  const { sections } = props;
  const [currentIndex, setCurrentIndex] = useState(0);

  const Component = sections[currentIndex].component;

  function toggleSectionHandler(index) {
    setCurrentIndex(index);
  }

  return (
    <div className={styles.normal}>
      <div className={styles.left} id="two-column-panel-left">
        {sections.map((s, index) => {
          const triggerCls = cls({
            [styles.trigger]: true,
            [styles.triggerActive]: index === currentIndex,
          });
          return (
            <div
              className={triggerCls}
              key={s.title}
              onClick={toggleSectionHandler.bind(this, index)}
            >
              <div className={styles.icon}>
                {typeof s.icon === 'string' && <Icon type={s.icon} width={64} height={64} />}
                {React.isValidElement(s.icon) && s.icon}
              </div>
              <div className={styles.title_desc}>
                <div className={styles.title}>{s.title}</div>
                <div className={styles.description}>{s.description}</div>
              </div>
            </div>
          );
        })}
      </div>
      <div className={styles.right} id="two-column-panel-right">
        <Component />
      </div>
    </div>
  );
};

export default TwoColumnPanel;
