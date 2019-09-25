import React from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import { HideWrapper } from '../Hide';
import { getScrollOffsets, getClientWidth, getClientHeight } from './utils';

const Container = styled.div`
  cursor: ${({ dragged }) => (dragged ? 'grab' : 'pointer')};
  position: fixed;
  z-index: 999;
  right: 60px;
  bottom: 30px;
  &:before {
    width: 0;
    height: 0;
    border: 5px solid transparent;
    border-top-color: rgba(0, 0, 0, 0.75);
    opacity: 0;
    pointer-events: none;
    transition: all 0.18s ease-out 0.18s;
    content: '';
    position: absolute;
    z-index: 10;
    bottom: 100%;
    left: 50%;
    transform: translate(-50%, 4px);
    transform-origin: top;
  }
  &:after {
    opacity: 0;
    pointer-events: none;
    transition: all 0.18s ease-out 0.18s;
    text-indent: 0;
    font-size: 12px;
    background: rgba(0, 0, 0, 0.75);
    border-radius: 2px;
    color: #fff;
    content: '图标只在 dev 环境下展现';
    padding: 0.5em 1em;
    position: absolute;
    white-space: nowrap;
    z-index: 10;
    bottom: 100%;
    left: 50%;
    margin-bottom: 10px;
    transform: translate(-50%, 4px);
    transform-origin: top;
  }

  @media screen and (max-width: 768px) {
    display: none;
  }

  * {
    box-sizing: border-box;
  }

  &:hover {
    ${HideWrapper} {
      opacity: 1;
      transform: scale(1);
    }
    &:before,
    &:after {
      opacity: ${({ open, hide }) => (open || hide ? 0 : 1)};
      pointer-events: none;
      transform: translate(-50%, 0);
    }
  }
`;

export default class Draggable extends React.Component {
  constructor(props) {
    super(props);
    this.node = null;

    this.intervalStart = 0;

    this.resizeX = null;
    this.resizeY = null;
    this.deltaX = 0;
    this.deltaY = 0;

    this.state = {
      dragged: false,
      width: 0,
    };
  }

  componentDidMount() {
    window.addEventListener('resize', this.handleResize, false);
    const node = ReactDOM.findDOMNode(this);
    const { width } = node.getBoundingClientRect();
    this.setState({
      width,
    });
  }

  componentWillUnmount() {
    window.removeEventListener('mousemove', this.handleMouseMove, false);
    window.removeEventListener('mouseup', this.handleMouseUp, false);
    window.removeEventListener('resize', this.handleResize, false);
  }

  handleResize = () => {
    const node = ReactDOM.findDOMNode(this);
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
    const node = ReactDOM.findDOMNode(this.node);
    const startX = e.clientX + scroll.x;
    const startY = e.clientY + scroll.y;

    const origX = node.offsetLeft;
    const origY = node.offsetTop;

    this.deltaX = startX - origX;
    this.deltaY = startY - origY;

    window.addEventListener('mousemove', this.handleMouseMove, true);
    window.addEventListener('mouseup', this.handleMouseUp, true);

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

  handleMouseMove = ({ clientX, clientY }) => {
    const { dragged } = this.state;
    const { deltaX, deltaY } = this;
    const node = ReactDOM.findDOMNode(this.node);
    const { onDrag, hide } = this.props;
    if (!dragged || !!hide) {
      return;
    }

    const scroll = getScrollOffsets();
    const clientWidth = getClientWidth();
    const clientHeight = getClientHeight();
    const { width, height, right: rectRight, bottom: rectBottom } = node.getBoundingClientRect();

    const left = clientX - scroll.x - deltaX;
    const top = clientY - scroll.y - deltaY;
    let right = clientWidth - left - width;
    let bottom = clientHeight - top - height;

    // boundary detection
    if (right > clientWidth - width) {
      right = clientWidth - width;
    }
    if (bottom > clientHeight - height) {
      bottom = clientHeight - height;
    }

    // console.log('logObj', {
    //   left,
    //   top,
    //   clientWidth,
    //   clientHeight,
    //   clientX,
    //   clientY,
    //   scrollX: scroll.x,
    //   scrollY: scroll.y,
    //   deltaX,
    //   deltaY,
    //   rectRight,
    //   rectBottom,
    //   width,
    //   height,
    //   hide,
    // });

    // for better performance
    node.style.right = `${right}px`;
    node.style.bottom = `${bottom}px`;

    this.setState(
      {
        dragged: true,
        // right,
        // bottom,
      },
      () => {
        if (onDrag) {
          onDrag({
            right,
            bottom,
          });
        }
      },
    );
  };

  handleMouseUp = e => {
    window.removeEventListener('mousemove', this.handleMouseMove, true);
    window.removeEventListener('mouseup', this.handleMouseUp, true);

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
    return (
      <Container
        ref={this.saveRef}
        onMouseDown={this.handleMouseDown}
        dragged={dragged}
        style={hide ? { right: -width / 1.5 } : {}}
        open={open}
        hide={hide}
      >
        {children}
      </Container>
    );
  }
}
