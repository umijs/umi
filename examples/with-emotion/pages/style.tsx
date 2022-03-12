import styled from '@emotion/styled';
import { Keyframes, keyframes } from '@emotion/react';

export const Wrapper = styled.section`
  text-align: center;
`;

export const Container = styled.div<{
  column?: boolean;
}>((props) => ({
  display: 'flex',
  alignItems: 'center',
  flexDirection: (props.column && 'column') || 'row',
}));

export const Title = styled.h1`
  font-size: 32px;
`;

export const bounce = keyframes`
  from, 20%, 53%, 80%, to {
    transform: translate3d(0,0,0);
  }

  40%, 43% {
    transform: translate3d(0, -30px, 0);
  }

  70% {
    transform: translate3d(0, -15px, 0);
  }

  90% {
    transform: translate3d(0,-4px,0);
  }
`;

export const Animation = styled.div<{
  name: Keyframes;
}>((props) => ({
  animation: `${props.name} 1s ease infinite`,
}));

export const Padding = styled.div<{
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}>((props) => ({
  paddingTop: `${props.top || 0}px`,
  paddingRight: `${props.right || 0}px`,
  paddingBottom: `${props.bottom || 0}px`,
  paddingLeft: `${props.left || 0}px`,
}));
