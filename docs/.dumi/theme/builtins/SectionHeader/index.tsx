import React from 'react';
// @ts-ignore
import './index.css';

export default (props: { title: string }) => {
  return (
    <div className="section-header">
      <div></div>
      <h2>{props.title}</h2>
      <div></div>
    </div>
  );
};
