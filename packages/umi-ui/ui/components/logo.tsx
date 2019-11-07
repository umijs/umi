import React from 'react';
import Icon from '@ant-design/icons';

export default props => {
  const SVGIcon = () => (
    <svg width={36} height={37} {...props}>
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
  return <Icon component={SVGIcon} {...props} />;
};
