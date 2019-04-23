import insert from './insertImportModule';

describe('insertImportModule', () => {
  it('can insert import statement', () => {
    const code = `
import React from 'react'
import { Button } from 'antd'

export default class App extends React.Component {
  render() {
    return <div>123</div>;
  }
}
`;
    const result = insert(code, {
      identifier: 'classnames',
      modulePath: 'classnames',
    });
    expect(result).toEqual(`import React from 'react';
import { Button } from 'antd';
import classnames from 'classnames';
export default class App extends React.Component {
  render() {
    return <div>123</div>;
  }
}
`);
  });
});
