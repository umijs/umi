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
    <svg
      version="1.1"
      id="dc-spinner"
      xmlns="http://www.w3.org/2000/svg"
      x="0px"
      y="0px"
      width="60px"
      height="60px"
      viewBox="3 3 34 34"
      preserveAspectRatio="xMinYMin meet"
    >
      <path
        fill="#1890ff"
        stroke="#1890ff"
        strokeWidth="1"
        strokeMiterlimit="10"
        d="M5.203,20
			c0-8.159,6.638-14.797,14.797-14.797V5C11.729,5,5,11.729,5,20s6.729,15,15,15v-0.203C11.841,34.797,5.203,28.159,5.203,20z"
        transform="rotate(278.217 20 20)"
      >
        <animateTransform
          attributeName="transform"
          type="rotate"
          from="0 20 20"
          to="360 20 20"
          calcMode="spline"
          keySplines="0.2, 0.2, 0.2, 0.2"
          keyTimes="0;1"
          dur="1.2s"
          repeatCount="indefinite"
        />
      </path>
    </svg>
  </Spinning>
);
