import { act, render } from '@testing-library/react';
import React from 'react';
import { TestBrowser } from '../../../.umi-test/testBrowser';

const waitTime = (time: number = 100) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
};

test('should show login form', async () => {
  const ref = React.createRef<any>();
  let rootContainer = render(
    <TestBrowser
      historyRef={ref}
      location={{
        pathname: '/user/login',
      }}
    />,
  );

  await waitTime(9000);

  expect(
    rootContainer.baseElement?.querySelector('.ant-pro-form-login-desc')
      ?.textContent,
  ).toBe(
    'Ant Design is the most influential web design specification in Xihu district',
  );

  act(() => {
    ref.current?.push('/user/register');
  });

  await waitTime(9000);

  expect(rootContainer.baseElement?.querySelector('h3')?.textContent).toBe(
    '注册',
  );
});
