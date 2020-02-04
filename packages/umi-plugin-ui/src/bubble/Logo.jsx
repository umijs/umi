import React from 'react';
import styled from 'styled-components';

const UmiLogo = props => (
  <svg width="1em" height="1em" viewBox="0 0 30 29" {...props}>
    <g fill="none" fillRule="evenodd">
      <path
        d="M28.563 13.889c0 .982-.797 1.778-1.78 1.778H3.217a1.778 1.778 0 01-.917-3.301 1.778 1.778 0 01.585-2.743A1.778 1.778 0 014.799 7.24a1.778 1.778 0 012.437-2.436 1.778 1.778 0 012.662-1.781 1.779 1.779 0 013.205-.847 1.78 1.78 0 013.349 0 1.779 1.779 0 013.206.846 1.778 1.778 0 012.662 1.781 1.778 1.778 0 012.437 2.436 1.778 1.778 0 011.915 2.383 1.778 1.778 0 01.7 2.589c.694.243 1.19.902 1.19 1.678z"
        stroke="#000"
        strokeWidth={0.8}
        fill="#FFF"
        strokeLinejoin="round"
      />
      <path fill="#000" d="M10.188 26.778h9.625V29h-9.625z" />
      <path
        d="M1 14.778h28c-.453 7.44-6.548 13.333-14 13.333S1.453 22.218 1 14.778h0z"
        stroke="#000"
        strokeWidth={0.8}
        fill="#1890FF"
      />
      <path
        d="M8.875 8.556a.441.441 0 01-.438-.445c0-.245.196-.444.438-.444s.438.199.438.444a.441.441 0 01-.438.445zm-1.75 2.222a.441.441 0 01-.438-.445c0-.245.196-.444.438-.444s.438.199.438.444a.441.441 0 01-.438.445zm1.75 1.778a.441.441 0 01-.438-.445c0-.245.196-.444.438-.444s.438.199.438.444a.441.441 0 01-.438.445zM10.625 9a.441.441 0 01-.438-.444c0-.246.196-.445.438-.445s.438.2.438.445a.441.441 0 01-.438.444zm10.5 1.778a.441.441 0 01-.438-.445c0-.245.196-.444.438-.444s.438.199.438.444a.441.441 0 01-.438.445z"
        fill="#000"
      />
    </g>
  </svg>
);

const BigfishLogo = props => (
  <svg width="1em" height="1em" viewBox="0 0 36 37" {...props}>
    <defs>
      <path
        d="M21.54 4.667c9.436 0 15.552 9.015 18.35 27.045a.4.4 0 01-.395.461H3.585a.4.4 0 01-.394-.461c2.797-18.03 8.914-27.045 18.35-27.045z"
        id="prefix__a"
      />
      <path
        d="M22.563 24.667c3.529 0 6.39-2.85 6.39-6.366 0-3.516-2.861-6.366-6.39-6.366-3.529 0-6.39 2.85-6.39 6.366 0 3.516 2.861 6.366 6.39 6.366z"
        id="prefix__d"
      />
      <linearGradient x1="50%" y1="-42.059%" x2="50%" y2="100%" id="prefix__b">
        <stop stopColor="#3852F9" offset="0%" />
        <stop stopColor="#1890FF" offset="100%" />
      </linearGradient>
      <filter
        x="-27.4%"
        y="-27.5%"
        width="154.8%"
        height="155%"
        filterUnits="objectBoundingBox"
        id="prefix__c"
      >
        <feMorphology radius={0.5} in="SourceAlpha" result="shadowSpreadOuter1" />
        <feOffset in="shadowSpreadOuter1" result="shadowOffsetOuter1" />
        <feMorphology radius={4.3} in="SourceAlpha" result="shadowInner" />
        <feOffset in="shadowInner" result="shadowInner" />
        <feComposite
          in="shadowOffsetOuter1"
          in2="shadowInner"
          operator="out"
          result="shadowOffsetOuter1"
        />
        <feGaussianBlur stdDeviation={1.5} in="shadowOffsetOuter1" result="shadowBlurOuter1" />
        <feColorMatrix
          values="0 0 0 0 0.062745098 0 0 0 0 0.137254902 0 0 0 0 0.619607843 0 0 0 0.5 0"
          in="shadowBlurOuter1"
        />
      </filter>
    </defs>
    <g fill="none" fillRule="evenodd">
      <g fillRule="nonzero">
        <path
          d="M14.856 19.057L.578 26.169A.4.4 0 010 25.81V11.587a.4.4 0 01.578-.358l14.278 7.112a.4.4 0 010 .716z"
          fill="#0D7EFF"
        />
        <use fill="url(#prefix__b)" transform="rotate(90 21.54 18.42)" xlinkHref="#prefix__a" />
        <g transform="rotate(-180 22.563 18.301)">
          <use fill="#000" filter="url(#prefix__c)" xlinkHref="#prefix__d" />
          <path
            stroke="#FFF"
            strokeWidth={4.8}
            d="M22.563 22.267c2.205 0 3.99-1.778 3.99-3.966s-1.785-3.966-3.99-3.966-3.99 1.778-3.99 3.966 1.785 3.966 3.99 3.966z"
            strokeLinejoin="square"
          />
        </g>
      </g>
      <path d="M-1 0h37v37H-1z" />
    </g>
  </svg>
);

export { UmiLogo, BigfishLogo };

export default ({ isBigfish }) => {
  const logo = isBigfish ? BigfishLogo : UmiLogo;
  return styled(logo)`
    position: absolute;
    top: 50%;
    user-select: none;
    transform: ${props =>
      props.open ? 'translateY(-50%) scale(0.4) rotate(45deg)' : 'translateY(-50%)'};
    opacity: ${props => (props.open ? 0 : 1)};
    transition: all 0.3s linear;
  `;
};
