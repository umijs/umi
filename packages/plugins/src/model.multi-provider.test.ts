/** @jest-environment jsdom */
import React, { act, useLayoutEffect, useState } from 'react';
import { createRoot, Root } from 'react-dom/client';
import { Provider, useModel } from '../libs/model';

test('existing and late subscribers remain consistent across shared roots', () => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true;
  const first = document.createElement('div');
  const second = document.createElement('div');
  document.body.append(first, second);
  const rootA = createRoot(first);
  const rootB = createRoot(second);
  let updateFirst: (count: number) => void;
  let showLate: () => void;

  function useCounter() {
    const [count, setCount] = useState(0);
    updateFirst = setCount;
    return { count, setCount };
  }
  function Subscriber() {
    const { count } = useModel('counter');
    return React.createElement('span', null, count);
  }
  function App() {
    const [show, setShow] = useState(false);
    showLate = () => setShow(true);
    return React.createElement(
      React.Fragment,
      null,
      React.createElement(Subscriber),
      show && React.createElement(Subscriber),
    );
  }
  const models = { counter: useCounter };

  try {
    act(() =>
      rootA.render(
        React.createElement(Provider, { models }, React.createElement(App)),
      ),
    );
    act(() => updateFirst(7));
    expect(first.textContent).toBe('7');

    act(() =>
      rootB.render(
        React.createElement(
          Provider,
          { models },
          React.createElement(Subscriber),
        ),
      ),
    );

    // Only App rerenders; Provider A must not rerender and mask the missed notification.
    act(() => showLate());
    expect(second.textContent).toBe('0');
    expect(
      Array.from(
        first.querySelectorAll('span'),
        (element) => element.textContent,
      ),
    ).toEqual(['0', '0']);
  } finally {
    act(() => rootA.unmount());
    act(() => rootB.unmount());
    first.remove();
    second.remove();
    delete globalThis.IS_REACT_ACT_ENVIRONMENT;
  }
});

describe('shared runtime initialization', () => {
  let mounted: { root: Root; container: HTMLDivElement }[];
  let errors: jest.SpyInstance;

  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    mounted = [];
    errors = jest.spyOn(console, 'error');
  });

  afterEach(() => {
    try {
      act(() => mounted.forEach(({ root }) => root.unmount()));
      expect(errors).not.toHaveBeenCalled();
    } finally {
      mounted.forEach(({ container }) => container.remove());
      delete globalThis.IS_REACT_ACT_ENVIRONMENT;
      errors.mockRestore();
    }
  });

  function mount(
    models: Record<string, any>,
    children: React.ReactNode,
    strict = false,
  ) {
    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);
    const entry = { root, container };
    mounted.push(entry);
    act(() => {
      root.render(
        React.createElement(
          strict ? React.StrictMode : React.Fragment,
          null,
          React.createElement(Provider, { models }, children),
        ),
      );
    });
    return entry;
  }

  test.each([false, true])(
    'initialization notifies existing subscribers after commit (StrictMode: %s)',
    (strict) => {
      let update: (count: number) => void;
      let committed = false;
      const notifications: boolean[] = [];
      const firstSelector = jest.fn((model) => {
        notifications.push(committed);
        return model.count;
      });
      const secondSelector = jest.fn((model) => model.count);
      function useCounter() {
        const [count, setCount] = useState(0);
        update = setCount;
        return { count };
      }
      function Subscriber({ selector }) {
        return React.createElement('span', null, useModel('counter', selector));
      }
      function CommitProbe() {
        useLayoutEffect(() => {
          committed = true;
        }, []);
        return React.createElement(Subscriber, { selector: secondSelector });
      }
      const models = { counter: useCounter };
      const first = mount(
        models,
        React.createElement(Subscriber, { selector: firstSelector }),
        strict,
      );
      const updateFirst = update;
      act(() => updateFirst(7));
      expect(first.container.textContent).toBe('7');

      notifications.length = 0;
      firstSelector.mockClear();
      const second = mount(models, React.createElement(CommitProbe), strict);
      const updateSecond = update;

      // The layout effect runs before Executor's passive effect. A render-time
      // broadcast would record false here and can trigger a React warning.
      expect(notifications).toEqual(strict ? [true, true] : [true]);
      expect(first.container.textContent).toBe('0');
      expect(second.container.textContent).toBe('0');

      firstSelector.mockClear();
      secondSelector.mockClear();
      act(() => updateSecond(9));
      expect(firstSelector).toHaveBeenCalledTimes(1);
      expect(secondSelector).toHaveBeenCalledTimes(1);
      expect(first.container.textContent).toBe('9');
      expect(second.container.textContent).toBe('9');

      act(() => second.root.render(null));
      firstSelector.mockClear();
      secondSelector.mockClear();
      act(() => updateFirst(11));
      expect(firstSelector).toHaveBeenCalledTimes(1);
      expect(secondSelector).not.toHaveBeenCalled();
      expect(first.container.textContent).toBe('11');
    },
  );

  test('initialization broadcasts once while later subscriptions stay linear', () => {
    let update: (count: number) => void;
    let showLate: () => void;
    const firstSelector = jest.fn((model) => model.count);
    const secondSelector = jest.fn((model) => model.count);
    const lateSelector = jest.fn((model) => model.count);
    function useCounter() {
      const [count, setCount] = useState(0);
      update = setCount;
      return { count };
    }
    function Subscriber({ selector }) {
      return React.createElement('span', null, useModel('counter', selector));
    }
    function subscribers(selector) {
      return Array.from({ length: 50 }, (_, key) =>
        React.createElement(Subscriber, { key, selector }),
      );
    }
    function App() {
      const [show, setShow] = useState(false);
      showLate = () => setShow(true);
      return React.createElement(
        React.Fragment,
        null,
        subscribers(firstSelector),
        show && subscribers(lateSelector),
      );
    }
    const models = { counter: useCounter };
    const first = mount(models, React.createElement(App));
    expect(firstSelector).toHaveBeenCalledTimes(100);
    act(() => update(7));
    firstSelector.mockClear();

    const second = mount(models, subscribers(secondSelector));
    // One initialization broadcast to each existing subscriber; initial
    // selection plus targeted catch-up for each new subscriber.
    expect(firstSelector).toHaveBeenCalledTimes(50);
    expect(secondSelector).toHaveBeenCalledTimes(100);
    expect(first.container.textContent).toBe('0'.repeat(50));
    expect(second.container.textContent).toBe('0'.repeat(50));

    firstSelector.mockClear();
    secondSelector.mockClear();
    act(() => showLate());
    expect(firstSelector).not.toHaveBeenCalled();
    expect(secondSelector).not.toHaveBeenCalled();
    expect(lateSelector).toHaveBeenCalledTimes(100);

    lateSelector.mockClear();
    act(() => update(5));
    expect(firstSelector).toHaveBeenCalledTimes(50);
    expect(secondSelector).toHaveBeenCalledTimes(50);
    expect(lateSelector).toHaveBeenCalledTimes(50);
    expect(first.container.textContent).toBe('5'.repeat(100));
    expect(second.container.textContent).toBe('5'.repeat(50));
  });

  test.each([false, true])(
    'dependent models synchronize across roots (StrictMode: %s)',
    (strict) => {
      let update: (count: number) => void;
      const models = {
        base: () => {
          const [count, setCount] = useState(0);
          update = setCount;
          return { count };
        },
        derived: () => {
          const count = useModel('base', (model) => model.count);
          return { doubled: count * 2 };
        },
      };
      function Subscriber() {
        const { count } = useModel('base');
        const { doubled } = useModel('derived');
        return React.createElement('span', null, `${count}:${doubled}`);
      }

      const first = mount(models, React.createElement(Subscriber), strict);
      const updateFirst = update;
      act(() => updateFirst(7));
      expect(first.container.textContent).toBe('7:14');

      const second = mount(models, React.createElement(Subscriber), strict);
      expect(first.container.textContent).toBe('0:0');
      expect(second.container.textContent).toBe('0:0');
      act(() => update(3));
      expect(first.container.textContent).toBe('3:6');
      expect(second.container.textContent).toBe('3:6');

      act(() => second.root.render(null));
      act(() => updateFirst(5));
      expect(first.container.textContent).toBe('5:10');
    },
  );
});
