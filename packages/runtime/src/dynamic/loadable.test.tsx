import { render } from '@testing-library/react';
import React from 'react';
import Loadable from './loadable';

function waitFor(delay: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, delay);
  });
}

function createLoader(
  delay: number,
  loader: null | (() => void),
  error?: Error,
) {
  return () => {
    return waitFor(delay).then(() => {
      if (loader) {
        return loader();
      } else {
        throw error;
      }
    });
  };
}

function MyLoadingComponent(
  props: React.PropsWithChildren<{
    prop: string;
  }>,
) {
  return <div>MyLoadingComponent {JSON.stringify(props)}</div>;
}

function MyComponent(props: React.PropsWithChildren<{ prop: string }>) {
  return <div>MyComponent {JSON.stringify(props)}</div>;
}

afterEach(async () => {
  try {
    await Loadable.preloadAll();
  } catch (err) {}
});

test('server side rendering', async () => {
  let LoadableMyComponent = Loadable<{ prop: string }>({
    loader: createLoader(400, () => require('../__fixtures__/component')),
    loading: MyLoadingComponent,
  });

  await Loadable.preloadAll();

  let component = render(<LoadableMyComponent prop="baz" />);

  expect(component.container.innerHTML).toMatchSnapshot(); // serverside
});

test('server side rendering es6', async () => {
  let LoadableMyComponent = Loadable<{ prop: string }>({
    loader: createLoader(400, () => require('../__fixtures__/component.es6')),
    loading: MyLoadingComponent,
  });

  await Loadable.preloadAll();

  let component = render(<LoadableMyComponent prop="baz" />);

  expect(component.container.innerHTML).toMatchSnapshot(); // serverside
});

test('preload', async () => {
  let LoadableMyComponent = Loadable<{ prop: string }>({
    loader: createLoader(400, () => MyComponent),
    loading: MyLoadingComponent,
  });

  let promise = LoadableMyComponent.preload();
  await waitFor(200);

  let component1 = render(<LoadableMyComponent prop="baz" />);

  expect(component1.container.innerHTML).toMatchSnapshot(); // still loading...
  await promise;
  expect(component1.container.innerHTML).toMatchSnapshot(); // success

  let component2 = render(<LoadableMyComponent prop="baz" />);
  expect(component2.container.innerHTML).toMatchSnapshot(); // success
});

test('render', async () => {
  let LoadableMyComponent = Loadable<{ prop: string }>({
    loader: createLoader(400, () => ({ MyComponent })),
    loading: MyLoadingComponent,
    render(loaded, props) {
      return <loaded.MyComponent {...props} />;
    },
  });
  let component = render(<LoadableMyComponent prop="baz" />);
  expect(component.container.innerHTML).toMatchSnapshot(); // initial
  await waitFor(200);
  expect(component.container.innerHTML).toMatchSnapshot(); // loading
  await waitFor(200);
  expect(component.container.innerHTML).toMatchSnapshot(); // success
});

test('loadable map success', async () => {
  let LoadableMyComponent = Loadable.Map<{ prop: string }>({
    loader: {
      a: createLoader(200, () => ({ MyComponent })),
      b: createLoader(400, () => ({ MyComponent })),
    },
    loading: MyLoadingComponent,
    render(loaded, props) {
      return (
        <div>
          <loaded.a.MyComponent {...props} />
          <loaded.b.MyComponent {...props} />
        </div>
      );
    },
  });

  let component = render(<LoadableMyComponent prop="baz" />);
  expect(component.container.innerHTML).toMatchSnapshot(); // initial
  await waitFor(200);
  expect(component.container.innerHTML).toMatchSnapshot(); // loading
  await waitFor(200);
  expect(component.container.innerHTML).toMatchSnapshot(); // success
});

test('loadable map error', async () => {
  let LoadableMyComponent = Loadable.Map<{
    prop: string;
  }>({
    loader: {
      a: createLoader(200, () => ({ MyComponent })),
      b: createLoader(400, null, new Error('test error')),
    },
    loading: MyLoadingComponent,
    render(loaded, props) {
      return (
        <div>
          <loaded.a.MyComponent {...props} />
          <loaded.b.MyComponent {...props} />
        </div>
      );
    },
  });

  let component = render(<LoadableMyComponent prop="baz" />);
  expect(component.container.innerHTML).toMatchSnapshot(); // initial
  await waitFor(200);
  expect(component.container.innerHTML).toMatchSnapshot(); // loading
  await waitFor(200);
  expect(component.container.innerHTML).toMatchSnapshot(); // success
});

describe('preloadReady', () => {
  beforeEach(() => {
    (global as any).__webpack_modules__ = { 1: true, 2: true };
  });

  afterEach(() => {
    delete (global as any).__webpack_modules__;
  });

  test('undefined', async () => {
    let LoadableMyComponent = Loadable<{ prop: string }>({
      loader: createLoader(200, () => MyComponent),
      loading: MyLoadingComponent,
    });

    await Loadable.preloadReady();

    let component = render(<LoadableMyComponent prop="baz" />);

    expect(component.container.innerHTML).toMatchSnapshot();
  });

  test('one', async () => {
    let LoadableMyComponent = Loadable<{ prop: string }>({
      loader: createLoader(200, () => MyComponent),
      loading: MyLoadingComponent,
      webpack: () => [1],
    });

    await Loadable.preloadReady();

    let component = render(<LoadableMyComponent prop="baz" />);

    expect(component.container.innerHTML).toMatchSnapshot();
  });

  test('many', async () => {
    let LoadableMyComponent = Loadable<{ prop: string }>({
      loader: createLoader(200, () => MyComponent),
      loading: MyLoadingComponent,
      webpack: () => [1, 2],
    });

    await Loadable.preloadReady();

    let component = render(<LoadableMyComponent prop="baz" />);

    expect(component.container.innerHTML).toMatchSnapshot();
  });

  test('missing', async () => {
    let LoadableMyComponent = Loadable<{ prop: string }>({
      loader: createLoader(200, () => MyComponent),
      loading: MyLoadingComponent,
      webpack: () => [1, 42],
    });

    await Loadable.preloadReady();

    let component = render(<LoadableMyComponent prop="baz" />);

    expect(component.container.innerHTML).toMatchSnapshot();
  });

  test('delay with 0', () => {
    let LoadableMyComponent = Loadable<{ prop: string }>({
      loader: createLoader(300, () => MyComponent),
      loading: MyLoadingComponent,
      delay: 0,
      timeout: 200,
    });

    let loadingComponent = render(<LoadableMyComponent prop="foo" />);

    expect(loadingComponent.container.innerHTML).toMatchSnapshot(); // loading
  });
});
