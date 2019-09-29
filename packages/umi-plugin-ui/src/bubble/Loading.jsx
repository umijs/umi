import React from 'react';
import styled, { keyframes } from 'styled-components';

const antSpinMove = keyframes`{
  to {
    opacity: 1;
  }
}`;

const antRotate = keyframes`{
  to {
    transform: rotate(405deg);
  }
}`;

const Spinning = styled('div')`
  box-sizing: border-box;
  margin: 0;
  padding: 0;
  color: rgba(0, 0, 0, 0.65);
  font-size: 14px;
  font-variant: tabular-nums;
  line-height: 1.5;
  list-style: none;
  font-feature-settings: 'tnum';
  position: static;
  display: inline-block;
  color: #1890ff;
  text-align: center;
  vertical-align: middle;
  opacity: 1;
  transition: -webkit-transform 0.3s cubic-bezier(0.78, 0.14, 0.15, 0.86);
  transition: transform 0.3s cubic-bezier(0.78, 0.14, 0.15, 0.86);
  transition: transform 0.3s cubic-bezier(0.78, 0.14, 0.15, 0.86),
    -webkit-transform 0.3s cubic-bezier(0.78, 0.14, 0.15, 0.86);
`;

const SpinningDotItem = styled.div`
  position: absolute;
  display: block;
  background-color: #1890ff;
  border-radius: 100%;
  transform: scale(0.75);
  transform-origin: 50% 50%;
  opacity: 0.3;
  animation: ${antSpinMove} 1s infinite linear alternate;
  &:nth-child(0) {
    top: 0;
    left: 0;
  }
  &:nth-child(1) {
    top: 0;
    right: 0;
    animation-delay: 0.4s;
  }
  &:nth-child(2) {
    right: 0;
    bottom: 0;
    animation-delay: 0.8s;
  }
  &:nth-child(3) {
    bottom: 0;
    left: 0;
    animation-delay: 1.2s;
  }
`;

const SpinningDot = styled.div`
  position: relative;
  display: inline-block;
  font-size: ${({ size }) => {
    if (size === 'lg') return '32px';
    if (size === 'sm') return '14px';
    return '20px';
  }};
  width: 1em;
  height: 1em;
  transform: rotate(45deg);
  animation: ${antRotate} 1.2s infinite linear;
  & > ${SpinningDotItem} {
    ${({ size }) => {
      if (size === 'lg') {
        return `
          width: 14px;
          height: 14px;
        `;
      }
      if (size === 'sm') {
        return `
          width: 6px;
          height: 6px;
        `;
      }
      return `
        width: 9px;
        height: 9px;
      `;
    }};
  }
`;

export default ({ size = 'lg' }) => (
  <Spinning>
    <SpinningDot size={size}>
      <SpinningDotItem />
      <SpinningDotItem />
      <SpinningDotItem />
      <SpinningDotItem />
    </SpinningDot>
  </Spinning>
);
