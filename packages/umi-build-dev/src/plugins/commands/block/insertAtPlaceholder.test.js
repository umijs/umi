import insert from './insertAtPlaceholder';

describe('insertAtPlaceholder', () => {
  it('can insert at placeholder', () => {
    const code = `
import React from 'react'

export default class App extends React.Component {
  render() {
    return (
      <React.Fragment>
        <Demo />
        {/* Keep this */}
      </React.Fragment>
    )
  }
}
`;
    const result = insert(code, {
      placeholder: /\{\/\* Keep this \*\/\}/g,
      content: '<Demo2 />\n{/* Keep this */}',
    });
    expect(result).toEqual(`import React from 'react';

export default class App extends React.Component {
  render() {
    return (
      <React.Fragment>
        <Demo />
        <Demo2 />
        {/* Keep this */}
      </React.Fragment>
    );
  }
}
`);
  });
});
