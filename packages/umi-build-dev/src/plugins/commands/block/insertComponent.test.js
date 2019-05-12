import insert from './insertComponent';

describe('insertAtPlaceholder', () => {
  it('can insert at placeholder', () => {
    const code = `import React from 'react';
import Demo1 from './Demo1';
export default class App extends React.Component {
  render() {
    return (
      <React.Fragment>
        <Demo />
      </React.Fragment>
    )
  }
}
`;
    const result = insert(code, {
      relativePath: './Demo2',
      identifier: 'Demo2',
    });
    expect(result).toEqual(`import React from 'react';
import Demo1 from './Demo1';
import Demo2 from './Demo2';
export default class App extends React.Component {
  render() {
    return (
      <React.Fragment>
        <Demo />
        <Demo2 />
      </React.Fragment>
    );
  }
}
`);
  });
});
