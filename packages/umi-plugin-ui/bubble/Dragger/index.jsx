import React from 'react';
import ReactDOM from 'react-dom';
import styled, { css } from 'styled-components';
import Hide, { HideWrapper } from '../Hide';

const Container = styled.div.attrs({
  style: ({ x, y }) => ({
    transform: `translate(${x}px, ${y}px)`,
  }),
})`
  cursor: ${({ open }) => (open ? 'pointer' : 'grab')};
  position: fixed;
  z-index: 999;
  right: 12px;
  bottom: 28px;
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
  ${({ isDragging, open }) =>
    isDragging &&
    !open &&
    css`
      cursor: grabbing;
    `};
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
    this.intervalStart = 0;
    this.resizeX = null;
    this.resizeY = null;

    this.state = {
      isDragging: false,

      originalX: 0,
      originalY: 0,

      translateX: 0,
      translateY: 0,

      lastTranslateX: 0,
      lastTranslateY: 0,
    };
  }

  componentDidMount() {
    window.addEventListener('resize', this.handleResize, false);
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
    e.preventDefault();
    e.stopPropagation();
    this.intervalStart = new Date().getTime();
    const { clientX, clientY } = e;
    window.addEventListener('mousemove', this.handleMouseMove, false);
    window.addEventListener('mouseup', this.handleMouseUp, false);

    if (this.props.onDragStart) {
      this.props.onDragStart();
    }

    this.setState({
      originalX: clientX,
      originalY: clientY,
      isDragging: true,
    });
  };

  handleMouseMove = ({ clientX, clientY }) => {
    const { isDragging } = this.state;
    const { onDrag, hide } = this.props;
    if (!isDragging || !!hide) {
      return;
    }

    this.setState(
      prevState => ({
        translateX: clientX - prevState.originalX + prevState.lastTranslateX,
        translateY: clientY - prevState.originalY + prevState.lastTranslateY,
      }),
      () => {
        if (onDrag) {
          onDrag({
            translateX: this.state.translateX,
            translateY: this.state.translateY,
          });
        }
      },
    );
  };

  handleMouseUp = e => {
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('mouseup', this.handleMouseUp);
    const interval = new Date().getTime() - this.intervalStart;
    if (interval < 150 && e.target.id !== 'umi-ui-mini-hide') {
      this.props.onClick(e);
      return;
    }

    this.setState(
      {
        originalX: 0,
        originalY: 0,
        lastTranslateX: this.state.translateX,
        lastTranslateY: this.state.translateY,

        isDragging: false,
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
    const { translateX, translateY, isDragging } = this.state;
    console.log('render isDragging', isDragging);

    return (
      <Container
        onMouseDown={this.handleMouseDown}
        x={hide ? 50 : translateX}
        y={translateY}
        isDragging={isDragging}
        open={open}
        hide={hide}
        onClick={this.onClick}
      >
        {children}
      </Container>
    );
  }
}
