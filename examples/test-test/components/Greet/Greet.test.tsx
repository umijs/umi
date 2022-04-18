import '@testing-library/jest-dom';
import { fireEvent, render, screen } from '@testing-library/react';
import React from 'react';
import Greet from './Greet';

test('renders Greet without name by inline snapshot', () => {
  const { container } = render(<Greet />);
  // prettier-ignore
  expect(container).toMatchInlineSnapshot(`
<div>
  <div>
    Hello 
    <span>
      Anonymous
    </span>
  </div>
</div>
`);
});

test('renders Greet without name by snapshot', () => {
  const { container } = render(<Greet />);
  expect(container).toMatchSnapshot();
});

test('renders Greet without name assert by testing-library', () => {
  const { container } = render(<Greet />);

  const greetDom = screen.getByText('Anonymous');
  expect(greetDom).toBeInTheDocument();
});

test('Greet click', async () => {
  const onClick = jest.fn();
  const { container } = render(<Greet onClick={onClick} />);

  const greetDom = screen.getByText('Anonymous');
  await fireEvent.click(screen.getByText(/hello/i));

  expect(onClick).toBeCalledTimes(1);
});
