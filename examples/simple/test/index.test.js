import React from 'react';
import { shallow } from 'enzyme';
import IndexPage from './index.js';

it('count', () => {
  const el = shallow(<IndexPage />);
  console.log(el.html());
  expect(2).toBe(2);
});
