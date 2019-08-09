import React, { useState } from 'react';
import { Icon } from 'antd';
import cls from 'classnames';
import styles from './index.less';

export default function(props) {
  const { sections } = props;
  const [currentIndex, setCurrentIndex] = useState(0);

  const Component = sections[currentIndex].component;

  function toggleSectionHandler(index) {
    setCurrentIndex(index);
  }

  return (
    <div className={styles.normal}>
      <div className={styles.left}>
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
                <Icon type={s.icon} />
              </div>
              <div className={styles.title_desc}>
                <div className={styles.title}>{s.title}</div>
                <div className={styles.description}>{s.description}</div>
              </div>
            </div>
          );
        })}
      </div>
      <div className={styles.right}>
        <Component />
      </div>
    </div>
  );
}
