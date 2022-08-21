import { render } from '@testing-library/react';
import Greet from './Greet';

jest.mock('./Greet', () => {
  return {
    __esModule: true,
    default: function () {
      return 'Mocked';
    },
  };
});

test('Greet with module mock', async () => {
  const { container } = render(<Greet />);

  expect(container).toMatchInlineSnapshot(`
    <div>
      Mocked
    </div>
  `);
});
