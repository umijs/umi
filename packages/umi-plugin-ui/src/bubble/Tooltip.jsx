import React from 'react';
import styled from 'styled-components';
import { render } from './utils';

export const TooltipWrapper = styled.div`
  opacity: 0;
  visibility: hidden;
  transition: all 0.18s ease-out 0.18s;
  text-indent: 0;
  font-size: 12px;
  background: rgba(0, 0, 0, 0.75);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  text-decoration: none;
  text-align: left;
  word-wrap: break-word;
  border-radius: 2px;
  color: #fff;
  padding: 0.5em 1em;
  margin-bottom: 10px;
  position: absolute;
  white-space: nowrap;
  z-index: 10;
  bottom: 100%;
  left: 50%;
  transform: translate(-50%, 4px);
  transform-origin: top;
  &:before {
    width: 0;
    height: 0;
    border: 5px solid transparent;
    border-top-color: rgba(0, 0, 0, 0.75);
    pointer-events: none;
    transition: all 0.18s ease-out 0.18s;
    content: '';
    position: absolute;
    z-index: 10;
    bottom: -10px;
    left: 50%;
    transform: translate(-50%, 0);
    transform-origin: top;
  }
  div {
    width: 156px;
    white-space: normal;
    &,
    * {
      margin: 0;
    }
  }
`;

const Link = styled.a`
  text-decoration: none;
  outline: 0;
  color: #1890ff;
  text-decoration: none;
  background-color: transparent;
  outline: none;
  cursor: pointer;
  transition: color 0.3s;
  &:hover {
    color: #40a9ff;
  }
`;

export default props => {
  const { isBigfish, message } = props;
  const helpDocUrl = isBigfish
    ? 'https://bigfish.antfin-inc.com/doc/bigfish_ui'
    : 'https://umijs.org/guide/umi-ui.html';

  const { intro, tooltip, helpDoc } = message;
  const introText = render(intro, {
    framework: isBigfish ? 'Bigfish' : 'Umi',
  });

  return (
    <TooltipWrapper>
      <div>
        <p>
          {introText}
          <Link target="_blank" rel="noopener noreferrer" href={helpDocUrl}>
            {helpDoc}
          </Link>
          {tooltip}
        </p>
      </div>
    </TooltipWrapper>
  );
};
