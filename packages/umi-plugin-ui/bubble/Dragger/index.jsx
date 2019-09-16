import React from 'react';
import styled, { css } from 'styled-components';
import { CloseWrapper } from '../Close';

export default class Draggable extends React.Component {
  constructor(props) {
    super(props);
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
    console.log('isDragging', isDragging);
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
    if (
      this.state.lastTranslateX === this.state.translateX &&
      this.state.lastTranslateY === this.state.translateY &&
      this.props.onClick &&
      e.target.id !== 'ui-bubble-close'
    ) {
      this.props.onClick(e);
    }
    window.removeEventListener('mousemove', this.handleMouseMove);
    window.removeEventListener('mouseup', this.handleMouseUp);
    console.log('handleMouseUp', this.state.isDragging);
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
    const { children, hide } = this.props;
    const { translateX, translateY, isDragging } = this.state;
    console.log('render isDragging', isDragging);

    return (
      <Container
        onMouseDown={this.handleMouseDown}
        x={hide ? 50 : translateX}
        y={translateY}
        isDragging={isDragging}
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
  cursor: grab;
  position: fixed;
  right: 16px;
  bottom: 16px;
  transition: transform 0.1s ease-out;

  ${({ isDragging }) =>
    isDragging &&
    css`
      opacity: 0.8;
      cursor: grabbing;
    `};
  &:hover ${CloseWrapper} {
    opacity: 1;
  }
`;
