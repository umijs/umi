import { fireEvent, render, screen } from '@testing-library/react';
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
  render(<Greet />);

  const greetDom = screen.getByText('Anonymous');
  expect(greetDom).toBeInTheDocument();
});

test('Greet click', async () => {
  const onClick = jest.fn();
  render(<Greet onClick={onClick} />);

  screen.getByText('Anonymous');
  fireEvent.click(screen.getByText(/hello/i));

  expect(onClick).toBeCalledTimes(1);
});

test('Greet with module doMock', async () => {
  jest.doMock('./Greet', () => {
    return {
      default: function () {
        return 'Mocked';
      },
    };
  });

  const Greet = require('./Greet').default;

  const { container } = render(<Greet />);

  expect(container).toMatchInlineSnapshot(`
    <div>
      Mocked
    </div>
  `);
});
