import React from 'react';

const Redirect = props => (
  <span className="anticon" tabIndex={-1} role="img">
    <svg
      viewBox="64 64 896 896"
      width="1em"
      height="1em"
      aria-hidden="true"
      fill="currentColor"
      focusable="false"
      {...props}
    >
      <path d="M96 896h-6.4c-16-3.2-25.6-16-25.6-32 0-9.6-6.4-201.6 169.6-374.4C348.8 374.4 508.8 355.2 576 352V192c0-12.8 6.4-25.6 19.2-28.8s25.6-3.2 35.2 6.4l320 288c6.4 6.4 9.6 16 9.6 22.4s-3.2 19.2-9.6 22.4l-320 288c-9.6 9.6-22.4 9.6-35.2 6.4-12.8-3.2-19.2-16-19.2-28.8V608c-51.2 0-160 9.6-240 60.8C198.4 752 124.8 880 121.6 880c-3.2 9.6-12.8 16-25.6 16z" />
    </svg>
  </span>
);

export default Redirect;
