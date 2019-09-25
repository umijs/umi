import React from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import { HideWrapper } from '../Hide';
import { getScrollOffsets, getClientWidth, getClientHeight } from './utils';

const Container = styled.div`
  cursor: ${({ dragged }) => (dragged ? 'grab' : 'pointer')};
  position: fixed;
  z-index: 999;
  right: ${props => {
    if (props.hide) {
      return -props.width / 1.5;
    }
    return props.right;
  }}px;
  bottom: ${props => props.bottom}px;
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
    content: '此图标只在 dev 环境下展现';
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
      right: 16,
      bottom: 16,
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
    const { left, top } = node.getBoundingClientRect();
    const { translateX, translateY } = this.state;
    // if (left <= 0) {
    //   // remember translateX
    //   if (this.resizeX === null) {
    //     this.resizeX = translateX;
    //   }
    //   this.setState(prev => ({
    //     translateX: prev.translateX - left,
    //   }))
    // }
    // if (top <= 0) {
    //   // remember translateY
    //   if (this.resizeY === null) {
    //     this.resizeY = translateY;
    //   }
    //   this.setState(prev => ({
    //     translateY: prev.translateY - top,
    //   }))
    // }

    // console.log('node.getBoundingClientRect()', node.getBoundingClientRect());
    // console.log('left', left);
    // console.log('top', top);
    // console.log('translateX', translateX);
    // console.log('translateY', translateY);
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
    const { dragged, deltaX, deltaY } = this.state;
    const node = ReactDOM.findDOMNode(this.node);
    const { onDrag, hide } = this.props;
    if (!dragged || !!hide) {
      return;
    }

    const scroll = getScrollOffsets();
    const clientWidth = getClientWidth();
    const clientHeight = getClientHeight();
    const { width, height } = node.getBoundingClientRect();

    const left = clientX - scroll.x - deltaX;
    const top = clientY - scroll.y - deltaY;
    const right = clientWidth - left - width;
    const bottom = clientHeight - top - height;

    this.setState(
      {
        right,
        bottom,
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

  render() {
    const { children, hide, open } = this.props;
    const { dragged, right, bottom, width } = this.state;
    console.log('render dragged', dragged);

    return (
      <Container
        ref={node => (this.node = node)}
        onMouseDown={this.handleMouseDown}
        right={right}
        bottom={bottom}
        dragged={dragged}
        open={open}
        hide={hide}
        width={width}
      >
        {children}
      </Container>
    );
  }
}
