import { transform } from '@babel/core';
import dedent from 'dedent';

function runPlugin(
  code: string,
  opts: { cwd: string; plugins?: any[]; filename: string },
) {
  const res = transform(dedent`${code}`, {
    babelrc: false,
    sourceType: 'module',
    presets: [
      [
        require.resolve('@babel/preset-react'),
        {
          development: true,
        },
      ],
    ],
    plugins: [[require.resolve('./babel-plugin-modify-anonymous')]],
    ...opts,
  });

  if (!res) {
    throw new Error('plugin failed');
  }

  return res;
}

test('normal arrow function', () => {
  const opts = {
    cwd: '/a/b/c',
    filename: '/a/b/c/src/index.tsx',
  };
  expect(
    runPlugin(
      `
    import { Button } from '@alipay/tech-ui';
    import { List, Foo } from 'antd';


    const { Item } = List;
    const FooBtn = Foo;

    function Hello() {}

    export default () => {
      const Bbaaa = {};
      return <div>
        <Button />
        <Button />
        <Item />
        <Item />
        <FooBtn />
      </div>;
    };
  `,
      opts,
    ).code,
  ).toEqual(
    runPlugin(
      `
    import { Button } from '@alipay/tech-ui';
    import { List, Foo } from 'antd';


    const { Item } = List;
    const FooBtn = Foo;

    function Hello() {}

    const SrcIndex = () => {
      const Bbaaa = {};
      return <div>
        <Button />
        <Button />
        <Item />
        <Item />
        <FooBtn />
      </div>;
    };
    export default SrcIndex;
    `,
      { ...opts, plugins: [] },
    ).code,
  );
});

test('normal anonymous function', () => {
  const opts = {
    cwd: '/a/b/c',
    filename: '/a/b/c/src/index.tsx',
  };
  expect(
    runPlugin(
      `
    import { Button } from '@alipay/tech-ui';
    import { List, Foo } from 'antd';


    const { Item } = List;
    const FooBtn = Foo;

    function Hello() {}

    export default function () {
      const Bbaaa = {};
      return <div>
        <Button />
        <Button />
        <Item />
        <Item />
        <FooBtn />
      </div>;
    };
  `,
      opts,
    ).code,
  ).toEqual(
    runPlugin(
      `
    import { Button } from '@alipay/tech-ui';
    import { List, Foo } from 'antd';


    const { Item } = List;
    const FooBtn = Foo;

    function Hello() {}

    export default function SrcIndex() {
      const Bbaaa = {};
      return <div>
        <Button />
        <Button />
        <Item />
        <Item />
        <FooBtn />
      </div>;
    };
    `,
      { ...opts, plugins: [] },
    ).code,
  );
});

test('conflict declaration anonymous arrow function', () => {
  const opts = {
    cwd: '/a/b/c',
    filename: '/a/b/c/src/index.tsx',
  };
  expect(
    runPlugin(
      `
    import { Button } from '@alipay/tech-ui';
    import { List, Foo } from 'antd';


    const { Item } = List;
    const FooBtn = Foo;

    function SrcIndex() {}

    export default () => {
      const Bbaaa = {};
      return <div>
        <Button />
        <Button />
        <Item />
        <Item />
        <FooBtn />
      </div>;
    };
  `,
      opts,
    ).code,
  ).toEqual(
    runPlugin(
      `
    import { Button } from '@alipay/tech-ui';
    import { List, Foo } from 'antd';


    const { Item } = List;
    const FooBtn = Foo;

    function SrcIndex() {}

    const SrcIndex0 = () => {
      const Bbaaa = {};
      return <div>
        <Button />
        <Button />
        <Item />
        <Item />
        <FooBtn />
      </div>;
    };

    export default SrcIndex0;
    `,
      { ...opts, plugins: [] },
    ).code,
  );
});

test('conflict declaration anonymous function', () => {
  const opts = {
    cwd: '/a/b/c',
    filename: '/a/b/c/src/index.tsx',
  };
  expect(
    runPlugin(
      `
    import { Button } from '@alipay/tech-ui';
    import { List, Foo } from 'antd';


    const { Item } = List;
    const FooBtn = Foo;

    function SrcIndex() {}

    export default function () {
      const Bbaaa = {};
      return <div>
        <Button />
        <Button />
        <Item />
        <Item />
        <FooBtn />
      </div>;
    };
  `,
      opts,
    ).code,
  ).toEqual(
    runPlugin(
      `
    import { Button } from '@alipay/tech-ui';
    import { List, Foo } from 'antd';


    const { Item } = List;
    const FooBtn = Foo;

    function SrcIndex() {}

    export default function SrcIndex0() {
      const Bbaaa = {};
      return <div>
        <Button />
        <Button />
        <Item />
        <Item />
        <FooBtn />
      </div>;
    };
    `,
      { ...opts, plugins: [] },
    ).code,
  );
});

test('no valid path', () => {
  const opts = {
    cwd: '/a/b/c',
    filename: '/a/b/c/node_modules/antd/index.tsx',
  };
  const source = `
  import { Button } from '@alipay/tech-ui';
  import { List, Foo } from 'antd';


  const { Item } = List;
  const FooBtn = Foo;

  function Hello() {}

  export default () => {
    const Bbaaa = {};
    return <div>
      <Button />
      <Button />
      <Item />
      <Item />
      <FooBtn />
    </div>;
  };
`;
  expect(runPlugin(source, opts).code).toEqual(
    runPlugin(source, { ...opts, plugins: [] }).code,
  );
});

test('normal arrow function components', () => {
  const opts = {
    cwd: '/a/b/c',
    filename: '/a/b/c/components/About.tsx',
  };
  expect(
    runPlugin(
      `
    import { Button } from '@alipay/tech-ui';
    import { List, Foo } from 'antd';


    const { Item } = List;
    const FooBtn = Foo;

    function Hello() {}

    export default () => {
      const Bbaaa = {};
      return <div>
        <Button />
        <Button />
        <Item />
        <Item />
        <FooBtn />
      </div>;
    };
  `,
      opts,
    ).code,
  ).toEqual(
    runPlugin(
      `
    import { Button } from '@alipay/tech-ui';
    import { List, Foo } from 'antd';


    const { Item } = List;
    const FooBtn = Foo;

    function Hello() {}

    const ComponentsAbout = () => {
      const Bbaaa = {};
      return <div>
        <Button />
        <Button />
        <Item />
        <Item />
        <FooBtn />
      </div>;
    };
    export default ComponentsAbout;
    `,
      { ...opts, plugins: [] },
    ).code,
  );
});

test('normal arrow function dynamic path', () => {
  const opts = {
    cwd: '/a/b/c',
    filename: '/a/b/c/src/pages/[id].tsx',
  };
  expect(
    runPlugin(
      `
    import { Button } from '@alipay/tech-ui';
    import { List, Foo } from 'antd';


    const { Item } = List;
    const FooBtn = Foo;

    function Hello() {}

    export default () => {
      const Bbaaa = {};
      return <div>
        <Button />
        <Button />
        <Item />
        <Item />
        <FooBtn />
      </div>;
    };
  `,
      opts,
    ).code,
  ).toEqual(
    runPlugin(
      `
    import { Button } from '@alipay/tech-ui';
    import { List, Foo } from 'antd';


    const { Item } = List;
    const FooBtn = Foo;

    function Hello() {}

    const SrcPagesId = () => {
      const Bbaaa = {};
      return <div>
        <Button />
        <Button />
        <Item />
        <Item />
        <FooBtn />
      </div>;
    };
    export default SrcPagesId;
    `,
      { ...opts, plugins: [] },
    ).code,
  );
});

test('with chinese name', () => {
  const opts = {
    cwd: '/a/b/c',
    filename: '/a/b/c/src/pages/主页.tsx',
  };
  expect(
    runPlugin(
      `
    import { Button } from '@alipay/tech-ui';
    import { List, Foo } from 'antd';


    const { Item } = List;
    const FooBtn = Foo;

    function Hello() {}

    export default () => {
      const Bbaaa = {};
      return <div>
        <Button />
        <Button />
        <Item />
        <Item />
        <FooBtn />
      </div>;
    };
  `,
      opts,
    ).code,
  ).toEqual(
    runPlugin(
      `
    import { Button } from '@alipay/tech-ui';
    import { List, Foo } from 'antd';


    const { Item } = List;
    const FooBtn = Foo;

    function Hello() {}

    const SrcPages = () => {
      const Bbaaa = {};
      return <div>
        <Button />
        <Button />
        <Item />
        <Item />
        <FooBtn />
      </div>;
    };
    export default SrcPages;
    `,
      { ...opts, plugins: [] },
    ).code,
  );
});
