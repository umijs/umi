import React from 'react';
import styled from 'styled-components';

export const ErrorSvg = props => (
  <svg width={28} height={28} {...props}>
    <g fill="currentColor" fillRule="nonzero">
      <path d="M14 0C6.269 0 0 6.269 0 14s6.269 14 14 14 14-6.269 14-14S21.731 0 14 0zm0 25.625C7.581 25.625 2.375 20.419 2.375 14S7.581 2.375 14 2.375 25.625 7.581 25.625 14 20.419 25.625 14 25.625z" />
      <path d="M12.5 8.5a1.5 1.5 0 103 0 1.5 1.5 0 00-3 0zM14.75 12h-1.5a.25.25 0 00-.25.25v8.5c0 .137.113.25.25.25h1.5a.25.25 0 00.25-.25v-8.5a.25.25 0 00-.25-.25z" />
    </g>
  </svg>
);

const ErrorWrapper = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  flex-direction: column;
  color: #fff;

  svg {
    color: #ffbf00;
    margin-bottom: 8px;
  }
  p {
    font-size: 16px;
    color: rgba(255, 255, 255, 0.85);
    line-height: 24px;
  }
  span {
    font-size: 14px;
    color: rgba(255, 255, 255, 0.65);
    font-weight: 300;
  }
`;

export default ({ isBigfish, message, tips }) => (
  <ErrorWrapper>
    <div style={{ maxWidth: '45%' }}>
      <ErrorSvg />
      <p>
        {isBigfish ? 'Bigfish' : 'Umi'} {message.offline}
      </p>
      <span>{tips || message.restart}</span>
    </div>
  </ErrorWrapper>
);
