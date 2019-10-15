import React from 'react';
import styled from 'styled-components';

export const HideWrapper = styled('div')`
  opacity: 0;
  position: absolute;
  transform: scale(0);
  top: 0px;
  right: -22px;
  width: 20px;
  height: 20px;
  cursor: pointer;
  display: flex;
  z-index: 999;
  transition: all 0.3s;
  justify-content: center;
  align-items: center;
  transition: all 0.18s ease-out 0.18s;
  background: rgba(0, 0, 0, 0.15);
  border-radius: 20px;
  &:hover {
    background: rgba(0, 0, 0, 0.35);
  }
`;

export const HideIcon = styled('div')`
  width: 6px;
  height: 2px;
  background: rgb(255, 255, 255);
  border-radius: 4px;
`;

export default ({ onClick }) => (
  <HideWrapper id="umi-ui-mini-hide" onClick={onClick}>
    <HideIcon />
  </HideWrapper>
);
