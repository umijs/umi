import * as React from 'react';
import { Anchor } from 'antd';
import cls from 'classnames';
import Context from '../../Context';
// import { AnchorProps } from 'antd/lib/anchor';
import styles from './Toc.module.less';

export interface IAntToc {
  href: string;
  title: string;
  className?: string;
  level?: 0 | 1 | 2;
}

export interface UiTocProps {
  anchors: IAntToc[];
  className?: string;
}

const UiToc: React.SFC<UiTocProps> = React.memo(props => {
  const { anchors, className } = props;
  const { theme } = React.useContext(Context);
  const anchorCls = cls(styles['ui-toc'], styles[`ui-toc-${theme}`], className);

  return (
    Array.isArray(anchors) &&
    anchors.length > 0 && (
      <Anchor className={anchorCls}>
        {anchors.map((anchor, i) => {
          const linkCls = cls([styles['ui-toc-link']], anchor.className, {
            [`ui-toc-link-${anchor.level || 0}`]: true,
          });
          return (
            <Anchor.Link key={i} href={anchor.href} title={anchor.title} className={linkCls} />
          );
        })}
      </Anchor>
    )
  );
});

export default UiToc;
