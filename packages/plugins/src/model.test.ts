/** @jest-environment jsdom */

import React, { act, useState } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { Provider, useModel } from '../libs/model';

let container: HTMLDivElement;
let root: Root;

beforeEach(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  container = document.createElement('div');
  document.body.appendChild(container);
  root = createRoot(container);
});

afterEach(() => {
  act(() => root.unmount());
  container.remove();
  delete globalThis.IS_REACT_ACT_ENVIRONMENT;
});

test('subscribing many components does linear work and still broadcasts model updates', () => {
  let setCount: (count: number) => void;
  const selector = jest.fn((model) => model.count);
  function useCounter() {
    const [count, updateCount] = useState(0);
    setCount = updateCount;
    return { count };
  }
  function Subscriber() {
    return React.createElement('span', null, useModel('counter', selector));
  }

  act(() => {
    root.render(
      React.createElement(
        Provider,
        { models: { counter: useCounter } },
        Array.from({ length: 50 }, (_, key) =>
          React.createElement(Subscriber, { key }),
        ),
      ),
    );
  });

  // One initial selection and one subscription catch-up per component.
  expect(selector).toHaveBeenCalledTimes(100);
  expect(container.textContent).toBe('0'.repeat(50));

  selector.mockClear();
  act(() => setCount(1));
  expect(selector).toHaveBeenCalledTimes(50);
  expect(container.textContent).toBe('1'.repeat(50));
});

test('a new subscriber catches model updates between render and subscription', () => {
  let count = 0;
  const models = { counter: () => ({ count }) };
  const rendered: number[] = [];
  function Subscriber() {
    const model = useModel('counter');
    rendered.push(model.count);
    return React.createElement('span', null, model.count);
  }

  act(() => {
    root.render(React.createElement(Provider, { models }));
  });
  count = 1;
  act(() => {
    root.render(
      React.createElement(
        Provider,
        { models },
        React.createElement(Subscriber),
      ),
    );
  });

  expect(rendered).toEqual([0, 1]);
  expect(container.textContent).toBe('1');
});

test('subscription catch-up preserves the callback error fallback', () => {
  let count = 0;
  const models = { counter: () => ({ count }) };
  const selector = jest.fn((model) => {
    if (model?.count === 1) {
      throw new Error('Cannot select this model value');
    }
    return model?.count ?? -1;
  });
  function Subscriber() {
    return React.createElement('span', null, useModel('counter', selector));
  }

  act(() => {
    root.render(React.createElement(Provider, { models }));
  });
  count = 1;
  act(() => {
    root.render(
      React.createElement(
        Provider,
        { models },
        React.createElement(Subscriber),
      ),
    );
  });

  expect(selector.mock.calls.map(([model]) => model?.count)).toEqual([
    0,
    1,
    undefined,
  ]);
  expect(container.textContent).toBe('-1');
});

test('switching namespaces and unmounting remove previous subscriptions', () => {
  let setFirst: (count: number) => void;
  let setSecond: (count: number) => void;
  const selector = jest.fn((model) => model.count);
  const models = {
    first: () => {
      const [count, setCount] = useState(10);
      setFirst = setCount;
      return { count };
    },
    second: () => {
      const [count, setCount] = useState(20);
      setSecond = setCount;
      return { count };
    },
  };
  function Subscriber({ namespace }: { namespace: string }) {
    return React.createElement('span', null, useModel(namespace, selector));
  }
  function render(namespace?: string) {
    act(() => {
      root.render(
        React.createElement(
          Provider,
          { models },
          namespace && React.createElement(Subscriber, { namespace }),
        ),
      );
    });
  }

  render('first');
  expect(container.textContent).toBe('10');
  render('second');
  expect(container.textContent).toBe('20');

  selector.mockClear();
  act(() => setFirst(11));
  expect(selector).not.toHaveBeenCalled();
  expect(container.textContent).toBe('20');

  act(() => setSecond(21));
  expect(selector).toHaveBeenCalledTimes(1);
  expect(container.textContent).toBe('21');

  render();
  selector.mockClear();
  act(() => setSecond(22));
  expect(selector).not.toHaveBeenCalled();
  expect(container.textContent).toBe('');
});

test('dependent models continue to propagate updates to consumers', () => {
  let setCount: (count: number) => void;
  const models = {
    base: () => {
      const [count, updateCount] = useState(1);
      setCount = updateCount;
      return { count };
    },
    derived: () => {
      const count = useModel('base', (model) => model.count);
      return { doubled: count * 2 };
    },
  };
  function Subscriber() {
    const base = useModel('base');
    const derived = useModel('derived');
    return React.createElement(
      'span',
      null,
      `${base.count}:${derived.doubled}`,
    );
  }

  act(() => {
    root.render(
      React.createElement(
        Provider,
        { models },
        React.createElement(Subscriber),
      ),
    );
  });
  expect(container.textContent).toBe('1:2');

  act(() => setCount(2));
  expect(container.textContent).toBe('2:4');
});

test('StrictMode resubscriptions do not duplicate model update notifications', () => {
  let setCount: (count: number) => void;
  const selector = jest.fn((model) => model.count);
  function useCounter() {
    const [count, updateCount] = useState(0);
    setCount = updateCount;
    return { count };
  }
  function Subscriber() {
    return React.createElement('span', null, useModel('counter', selector));
  }

  act(() => {
    root.render(
      React.createElement(
        React.StrictMode,
        null,
        React.createElement(
          Provider,
          { models: { counter: useCounter } },
          React.createElement(Subscriber),
        ),
      ),
    );
  });

  selector.mockClear();
  act(() => setCount(1));
  expect(selector).toHaveBeenCalledTimes(1);
  expect(container.textContent).toBe('1');
});
