import insert from './insertComponent';

describe('insertComponent', () => {
  it('can insert with class component', () => {
    const code = `import React from 'react';
import Demo1 from './Demo1';
export default class App extends React.Component {
  render() {
    // keep comment test
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
    // keep comment test
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

  it('can insert with pure arrow function component', () => {
    const code = `import React from 'react';
import Demo1 from './Demo1';
export default () => {
  return (
    <React.Fragment>
      <Demo />
    </React.Fragment>
  );
};
`;
    const result = insert(code, {
      relativePath: './Demo2',
      identifier: 'DemoName',
    });
    expect(result).toEqual(`import React from 'react';
import Demo1 from './Demo1';
import DemoName from './Demo2';
export default () => {
  return (
    <React.Fragment>
      <Demo />
      <DemoName />
    </React.Fragment>
  );
};
`);
  });

  it('can insert with pure common function component', () => {
    const code = `import React from 'react';
import Demo1 from './Demo1';
export default function FuncComponent() {
  return (
    <React.Fragment>
      <Demo />
    </React.Fragment>
  );
}
`;
    const result = insert(code, {
      relativePath: './Demo2',
      identifier: 'DemoName',
    });
    expect(result).toEqual(`import React from 'react';
import Demo1 from './Demo1';
import DemoName from './Demo2';
export default function FuncComponent() {
  return (
    <React.Fragment>
      <Demo />
      <DemoName />
    </React.Fragment>
  );
}
`);
  });
});
