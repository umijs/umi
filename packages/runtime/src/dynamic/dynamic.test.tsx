import { getByText, render, waitFor } from '@testing-library/react';
import React from 'react';
import dynamic from './dynamic';

const delay = (timeout: number) =>
  new Promise((resolve) => setTimeout(resolve, timeout));

test('dynamic', async () => {
  const App = dynamic({
    loader: async () => {
      await delay(100);
      return () => <h1>App</h1>;
    },
  });
  const { container } = render(<App />);
  expect(container.innerHTML).toEqual('<p>loading...</p>');
  await waitFor(() => getByText(container, 'App'));
  expect(container.innerHTML).toEqual('<h1>App</h1>');
});

test('dynamic + Promise args', async () => {
  const App = dynamic(async () => {
    await delay(100);
    return () => <h1>App</h1>;
  });
  const { container } = render(<App />);
  expect(container.innerHTML).toEqual('<p>loading...</p>');
  await waitFor(() => getByText(container, 'App'));
  expect(container.innerHTML).toEqual('<h1>App</h1>');
});

test('Unexpect arguments', async () => {
  expect(() => {
    dynamic(1);
  }).toThrow(/Unexpect arguments/);
});
