import React from 'react';

export default class extends React.Component {
  render() {
    return (
      <div>
        <GUmiUIFlag filename="/tmp/origin.js" index="0" />
        <h1>foo</h1>
        <GUmiUIFlag filename="/tmp/origin.js" index="1" />
      </div>
    );
  }
}
