import React from 'react';
import styled from 'styled-components';

const LoadingWrapper = styled.div`
  width: 100%;
  text-align: center;
  margin-top: 160px;
  color: #8a9099;
  .csshub-loading {
    display: flex;
    justify-content: center;
    margin-bottom: 32px;
  }
  .csshub-loading-icon {
    padding: 10px;
    width: 10px;
    height: 10px;
    border-top: 20px solid #ed5548;
    border-right: 20px solid #599cd3;
    border-bottom: 20px solid #5cbd5e;
    border-left: 20px solid #fdd901;
    background: transparent;
    animation: csshub-rotate-right-round 1.2s ease-in-out infinite alternate;
  }
  @keyframes csshub-rotate-right-round {
    0% {
      transform: rotate(0deg);
    }
    50% {
      transform: rotate(180deg);
    }
    100% {
      transform: rotate(360deg);
      border-radius: 50%;
    }
  }
`;

const Loading = () => {
  return (
    <LoadingWrapper>
      <div className="csshub-loading">
        <div className="csshub-loading-icon"></div>
      </div>
      <p>loading...</p>
    </LoadingWrapper>
  );
};

export default Loading;
