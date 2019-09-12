import React from 'react';
import styled from 'styled-components';

export const CloseWrapper = styled('div')`
  opacity: 0;
  position: absolute;
  top: 0px;
  right: 6px;
  width: 20px;
  height: 20px;
  cursor: pointer;
  display: flex;
  -webkit-box-pack: center;
  justify-content: center;
  -webkit-box-align: center;
  align-items: center;
  transition: opacity 0.2s ease 0s, background 0.2s ease 0s;
  background: rgb(203, 203, 203);
  border-radius: 20px;
  &:hover {
    background: rgb(48, 85, 234);
  }
`;

export const CloseIcon = styled('div')`
  width: 6px;
  height: 2px;
  background: rgb(255, 255, 255);
  border-radius: 4px;
`;

export default ({ onClick }) => {
  return (
    <CloseWrapper onClick={onClick}>
      <CloseIcon />
    </CloseWrapper>
  );
};
