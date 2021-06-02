import { dependenceDiff } from './utils';

xtest('dependenceDiff', () => {
  expect(
    dependenceDiff(
      {
        antd: '4.0.0',
      },
      {
        antd: '3.0.0',
      },
    ),
  ).toEqual('MODIFY');
  expect(
    dependenceDiff(
      {
        antd: '4.0.0',
      },
      {
        antd: '4.0.0',
        lodash: '0.0.0',
      },
    ),
  ).toEqual('ADD');
  expect(
    dependenceDiff(
      {
        antd: '4.0.0',
        lodash: '0.0.0',
      },
      {
        antd: '4.0.0',
      },
    ),
  ).toEqual('REMOVE');
  expect(
    dependenceDiff(
      {
        antd: '4.0.0',
        lodash: '0.0.0',
      },
      {
        antd: '3.0.0',
      },
    ),
  ).toEqual('MODIFY');
});
