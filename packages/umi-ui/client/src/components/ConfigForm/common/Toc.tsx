import * as React from 'react';
import { Anchor } from 'antd';
import cls from 'classnames';
import history from '@tmp/history';
import Context from '@/layouts/Context';
// import { AnchorProps } from 'antd/lib/anchor';
import styles from './Toc.less';

export interface IToc {
  href: string;
  title: string;
  className?: string;
  level?: 0 | 1 | 2;
}

export interface UiTocProps {
  anchors: IToc[];
  getContainer?: () => HTMLElement | Window;
  className?: string;
}

const UiToc: React.SFC<UiTocProps> = React.memo(props => {
  const { anchors, className, getContainer } = props;
  const anchorRef = React.useRef(null);
  const { theme } = React.useContext(Context);
  const anchorCls = cls(styles['ui-toc'], styles[`ui-toc-${theme}`], className);

  React.useEffect(() => {
    const { hash } = window.location;
    if (hash && anchorRef.current) {
      anchorRef.current.handleScrollTo(hash);
    }
  });

  const getAnchorHref = href => {
    return `#${href.replace('#', '')}`;
  };

  const handleClick = (e, { href }) => {
    e.preventDefault();
    if (anchorRef.current) {
      // anchorRef.current.handleScrollTo(href);
      history.push({
        hash: href,
      });
    }
  };

  return (
    Array.isArray(anchors) &&
    anchors.length > 0 && (
      <Anchor
        ref={anchorRef}
        onClick={handleClick}
        className={anchorCls}
        getContainer={getContainer}
      >
        {anchors.map((anchor, i) => {
          const linkCls = cls([styles['ui-toc-link']], anchor.className, {
            [styles['ui-toc-link']]: true,
            [styles[`ui-toc-link-${anchor.level || 0}`]]: true,
          });
          return (
            <Anchor.Link
              key={i}
              href={getAnchorHref(anchor.href)}
              title={anchor.title}
              className={linkCls}
            />
          );
        })}
      </Anchor>
    )
  );
});

export default UiToc;
