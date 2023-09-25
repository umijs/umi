// @ts-ignore
import styles from './foo.css';

test('fetch polyfill', () => {
  expect(typeof fetch).toEqual('function');
});

test('jsdom', () => {
  expect(typeof window).toBe('object');
  const element = document.createElement('div');
  expect(element).not.toBeNull();
});

test('css modules', () => {
  expect(styles.foo).toEqual('foo');
});

test('class', () => {
  class A {
    public foo() {
      return 'foo';
    }
  }

  const a = new A();
  expect(a.foo()).toEqual('foo');
});
