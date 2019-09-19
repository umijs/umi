import React from 'react';
import ReactDOM from 'react-dom';
import styled, { css } from 'styled-components';
import Hide, { HideWrapper } from '../Hide';

export default class Draggable extends React.Component {
  constructor(props) {
    super(props);
    this.intervalStart = 0;

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

  componentWillUnmount() {
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('mouseup', this.handleMouseUp);
  }

  handleMouseDown = e => {
    e.preventDefault();
    e.stopPropagation();
    this.intervalStart = new Date().getTime();
    const { clientX, clientY } = e;
    window.addEventListener('mousemove', this.handleMouseMove);
    window.addEventListener('mouseup', this.handleMouseUp);

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
        onClick={this.onClick}
      >
        {children}
      </Container>
    );
  }
}

const Container = styled.div.attrs({
  style: ({ x, y }) => ({
    transform: `translate(${x}px, ${y}px)`,
  }),
})`
  cursor: ${props => (props.open ? 'pointer' : 'grab')};
  position: fixed;
  right: 16px;
  bottom: 16px;

  ${({ isDragging, open }) =>
    isDragging &&
    !open &&
    css`
      cursor: grabbing;
    `};
  &:hover ${HideWrapper} {
    opacity: 1;
  }
`;
