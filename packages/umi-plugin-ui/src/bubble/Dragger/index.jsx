import React from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import { HideWrapper } from '../Hide';
import { TooltipWrapper } from '../Tooltip';
import { getScrollOffsets, getClientWidth, getScrollBarSize, getClientHeight } from '../utils';

const initRight = 60;
const initBottom = 30;

const Container = styled.div`
  @media screen and (max-width: 768px) {
    display: none;
  }

  * {
    box-sizing: border-box;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB',
      'Microsoft YaHei', 'Helvetica Neue', Helvetica, Arial, sans-serif, 'Apple Color Emoji',
      'Segoe UI Emoji', 'Segoe UI Symbol';
  }

  &:hover {
    ${({ hide, dragged }) => (hide && !dragged ? 'right: 0!important;' : '')}
    ${HideWrapper} {
      opacity: 1;
      transform: scale(1);
    }
    ${TooltipWrapper} {
      opacity: ${({ open, hide }) => (open || hide ? 0 : 1)};
      visibility: visible;
      transform: translate(-50%, 0);
    }
  }
`;

export default class Draggable extends React.Component {
  constructor(props) {
    super(props);
    this.node = null;

    this.intervalStart = 0;

    this.deltaX = 0;
    this.deltaY = 0;

    this.defaultScrollBarSize = getScrollBarSize();

    this.state = {
      dragged: false,
      width: 0,
    };
  }

  isFixedElem = element => {
    const position =
      element && window.getComputedStyle(element) && window.getComputedStyle(element).position
        ? window.getComputedStyle(element).position
        : 'static';
    return position === 'fixed';
  };

  overlapDetection = () => {
    const node = this.nodeDom;
    const { left, top, right, bottom, width, height } = node.getBoundingClientRect();
    const aroundElems = [
      document.elementFromPoint(left, top),
      document.elementFromPoint(right, bottom),
      document.elementFromPoint(left + width / 2, top + height / 2),
    ];

    // eslint-disable-next-line no-restricted-syntax
    for (const elem of aroundElems) {
      if (elem !== node && this.isFixedElem(elem)) {
        // other element
        // const { width: aroundW, height: aroundH } = elem.getBoundingClientRect();
        // const adjustRight = width / 2 + aroundW / 2 + initRight;
        // const adjustBottom = height / 2 + aroundH / 2 + initBottom;
        // console.log('offsetRight', adjustRight, 'offsetBottom', adjustBottom);
        // node.style.right = `${adjustRight}px`;
        // node.style.bottom = `${adjustBottom}px`;
        if (this.props.onOverlap) {
          this.props.onOverlap();
        }
        break;
      }
    }
  };

  componentDidMount() {
    const { hide } = this.props;
    window.addEventListener('resize', this.handleResize, false);
    // eslint-disable-next-line
    this.nodeDom = ReactDOM.findDOMNode(this);
    const { width } = this.nodeDom.getBoundingClientRect();
    window.addEventListener('load', this.overlapDetection, false);
    this.setState({
      width,
    });
  }

  componentDidUpdate(preProps) {
    const { open: preOpen } = preProps;
    const { open } = this.props;
    const bodyIsOverflowing =
      document.body.scrollHeight > (window.innerHeight || document.documentElement.clientHeight) &&
      window.innerWidth > document.body.offsetWidth;

    // 关闭到打开 增加 right
    if (!preOpen && open) {
      const scrollBarSize = getScrollBarSize();
      const dom = this.nodeDom;
      const right = dom.style.right || '60px';
      if (dom && bodyIsOverflowing) {
        requestAnimationFrame(() => {
          dom.style.right = `${parseInt(right.replace('px', ''), 0) + scrollBarSize}px`;
        });
      }
    }
    // 打开到关闭，减少right
    if (preOpen && !open) {
      const scrollBarSize = getScrollBarSize();
      const dom = this.nodeDom;
      const right = dom.style.right || '60px';
      if (dom && bodyIsOverflowing) {
        requestAnimationFrame(() => {
          dom.style.right = `${parseInt(right.replace('px', ''), 0) - scrollBarSize}px`;
        });
      }
    }
  }

  componentWillUnmount() {
    window.removeEventListener('load', this.overlapDetection, false);
    this.removeMouseEventListener();
    window.removeEventListener('resize', this.handleResize, false);
  }

  handleResize = () => {
    // update defaultScrollBarSize
    this.defaultScrollBarSize = getScrollBarSize();
    const node = this.nodeDom;
    const clientRect = node.getBoundingClientRect();
    const { width, height } = clientRect;
    const { right: styleRight, bottom: styleBottom } = window.getComputedStyle(node);
    let right = Number(styleRight.replace('px', ''));
    let bottom = Number(styleBottom.replace('px', ''));

    const clientWidth = getClientWidth();
    const clientHeight = getClientHeight();

    const deltaX = clientWidth - right - width;
    const deltaY = clientHeight - bottom - height;

    // console.log('resize obj', {
    //   deltaX,
    //   deltaY,
    //   right,
    //   bottom,
    //   clientRect,
    // });

    // drag boundary detection
    if (deltaX < 0) {
      right += deltaX;
    }
    if (deltaY < 0) {
      bottom += deltaY;
    }

    node.style.bottom = `${bottom}px`;
    node.style.right = `${right}px`;
  };

  handleMouseDown = e => {
    this.intervalStart = new Date().getTime();
    const scroll = getScrollOffsets();
    const node = this.nodeDom;
    const startX = e.clientX + scroll.x;
    const startY = e.clientY + scroll.y;

    const origX = node.offsetLeft;
    const origY = node.offsetTop;

    this.deltaX = startX - origX;
    this.deltaY = startY - origY;

    this.addMouseEventListener();

    if (this.props.onDragStart) {
      this.props.onDragStart();
    }

    this.setState({
      dragged: true,
    });

    // We've handled this event. Don't let anybody else see it.
    if (e.stopPropagation) e.stopPropagation();
    // Standard model
    else e.cancelBubble = true; // IE

    // Now prevent any default action.
    if (e.preventDefault) e.preventDefault();
    // Standard model
    else e.returnValue = false; // IE
  };

  handleContextMenu = () => {
    this.removeMouseEventListener();
  };

  addMouseEventListener = () => {
    window.addEventListener('contextmenu', this.handleContextMenu, false);
    window.addEventListener('mousemove', this.handleMouseMove, false);
    window.addEventListener('mouseup', this.handleMouseUp, false);
  };

  removeMouseEventListener = () => {
    window.removeEventListener('contextmenu', this.handleContextMenu, false);
    window.removeEventListener('mousemove', this.handleMouseMove, false);
    window.removeEventListener('mouseup', this.handleMouseUp, false);
  };

  handleMouseMove = e => {
    const { clientX, clientY } = e;
    if (e.button !== 0) {
      // not left mouse down
      this.removeMouseEventListener();
      return;
    }
    const { dragged } = this.state;
    const { deltaX, deltaY } = this;
    const node = this.nodeDom;
    const { hide } = this.props;
    if (!dragged || !!hide) {
      return;
    }
    const scroll = getScrollOffsets();
    const clientWidth = getClientWidth();
    const clientHeight = getClientHeight();
    const { width, height } = node.getBoundingClientRect();
    const left = clientX + scroll.x - deltaX;
    const top = clientY + scroll.y - deltaY;
    let right = clientWidth - left - width;
    let bottom = clientHeight - top - height;

    // boundary detection
    // left boundary
    if (right > clientWidth - width) {
      right = clientWidth - width;
    }
    // top boundary
    if (bottom > clientHeight - height) {
      bottom = clientHeight - height;
    }
    // right boundary
    if (right < 0) {
      right = 0;
    }
    // bottom boundary
    if (bottom < 0) {
      bottom = 0;
    }

    // for better performance
    node.style.right = `${right - this.defaultScrollBarSize}px`;
    node.style.bottom = `${bottom}px`;

    this.setState(
      {
        dragged: true,
        // right,
        // bottom,
      },
      () => {
        if (this.props.onDrag) {
          this.props.onDrag({
            right,
            bottom,
          });
        }
      },
    );
  };

  handleMouseUp = e => {
    this.removeMouseEventListener();
    const interval = new Date().getTime() - this.intervalStart;
    if (interval < 150 && e.target.id !== 'umi-ui-mini-hide') {
      this.props.onClick(e);
      this.setState({
        dragged: false,
      });
      return;
    }

    this.setState(
      {
        dragged: false,
      },
      () => {
        if (this.props.onDragEnd) {
          this.props.onDragEnd();
        }
      },
    );
  };

  saveRef = node => {
    if (node) {
      this.node = node;
    }
  };

  render() {
    const { children, hide, open } = this.props;
    const { dragged, width } = this.state;

    const style = {
      cursor: dragged ? 'grab' : 'pointer',
      position: 'fixed',
      zIndex: 999,
      right: hide ? -width / 1.5 : initRight,
      bottom: initBottom,
      fontSize: 14,
      transition: hide ? 'all .3s' : '',
    };

    return (
      <Container
        ref={this.saveRef}
        onMouseDown={this.handleMouseDown}
        dragged={dragged}
        style={style}
        open={open}
        hide={hide}
      >
        {children}
      </Container>
    );
  }
}
