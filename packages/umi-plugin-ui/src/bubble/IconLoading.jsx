import React from 'react';
import styled, { keyframes } from 'styled-components';

const bounceTransform = keyframes`{
    0%, 100% { 
        transform: scale(0.4);
      } 50% { 
        transform: scale(1.0);
      }
}`;

const Bounce = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: #1890ff;
  opacity: 0.6;
  position: absolute;
  top: 0;
  left: 0;
  animation: ${bounceTransform} 2s infinite ease-in-out;
`;

const BounceTwo = styled.div`
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: #1890ff;
  opacity: 0.6;
  position: absolute;
  top: 0;
  left: 0;
  animation-delay: -1s;
  animation: ${bounceTransform} 2s infinite ease-in-out;
`;

const Spinning = styled.div`
  width: 60px;
  height: 60px;
  position: absolute;
  top: 0;
  left: 0;
`;

export default () => (
  <Spinning>
    <Bounce />
    <BounceTwo />
  </Spinning>
);
