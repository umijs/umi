import { shallow } from 'enzyme';
import { add } from './count';

it('count', () => {
  console.log('test log-----');
  expect(add(1)).toBe(2);
});
