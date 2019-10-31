import React from 'react';
import { Popconfirm, Tooltip, Divider } from 'antd';
import { formatMessage } from 'umi-plugin-react/locale';
import cls from 'classnames';
import { Close, Enter, Delete } from '@ant-design/icons';
import styles from './FooterToolbar.less';

type noop = () => void;
type OnResizeType = (params: { deltaX: number; deltaY: number }) => void;

export interface IFooterToolbarProps {
  className?: string;
  resizeAxis?: 'x' | 'y' | boolean;
  onResize?: OnResizeType;
  onClear: noop;
  onScrollBottom: noop;
  onClose: noop;
}

const FooterToolbar: React.FC<IFooterToolbarProps> = props => {
  const ref = React.createRef<HTMLDivElement>();
  const { className, onClear, onScrollBottom, resizeAxis = false, onResize, onClose } = props;
  const defaultAxis = typeof resizeAxis === 'boolean' ? 'y' : resizeAxis;
  const resizeCls = cls({
    [styles['section-drawer-toolbar-resize']]: !!resizeAxis,
    [styles[`section-drawer-toolbar-resize-${defaultAxis}`]]: !!resizeAxis,
  });
  const toolbarCls = cls(styles['section-drawer-toolbar'], resizeCls, className);

  const handleMouseDown = (e: MouseEvent) => {
    if (ref.current) {
      const deltaY = e.clientY - ref.current.offsetTop;

      const handleMouseMove = (e: MouseEvent) => {
        const moveDeltaY = deltaY - e.clientY;
        if (onResize) {
          onResize({
            // TODO: support X drag
            deltaX: 0,
            deltaY: moveDeltaY,
          });
        }
      };
      const handleMouseUp = (e: MouseEvent) => {
        window.removeEventListener('mousemove', handleMouseMove, false);
        window.removeEventListener('mouseup', handleMouseUp, false);
      };
      window.addEventListener('mousemove', handleMouseMove, false);
      window.addEventListener('mouseup', handleMouseUp, false);

      // We've handled this event. Don't let anybody else see it.
      if (e.stopPropagation) e.stopPropagation();
      // Standard model
      else e.cancelBubble = true; // IE

      // Now prevent any default action.
      if (e.preventDefault) e.preventDefault();
      // Standard model
      else e.returnValue = false; // IE
    }
  };

  return (
    <div ref={ref} className={toolbarCls} onMouseDown={resizeAxis ? handleMouseDown : () => {}}>
      <h1 className={styles['section-drawer-toolbar-title']}>
        {formatMessage({ id: 'org.umi.ui.global.terminal.upperCase' })}
      </h1>
      <div className={styles['section-drawer-toolbar-action']}>
        <Popconfirm
          title={formatMessage({ id: 'org.umi.ui.global.log.clear.confirm' })}
          onConfirm={onClear}
        >
          <Tooltip title={formatMessage({ id: 'org.umi.ui.global.log.clear.tooltip' })}>
            <Delete />
          </Tooltip>
        </Popconfirm>
        <Tooltip title={formatMessage({ id: 'org.umi.ui.global.log.enter.tooltip' })}>
          <Enter onClick={onScrollBottom} />
        </Tooltip>
        <Divider type="vertical" />
        <Close onClick={onClose} />
      </div>
    </div>
  );
};

export default FooterToolbar;
