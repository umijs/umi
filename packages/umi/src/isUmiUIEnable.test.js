import { join } from 'path';
import isUmiUIEnable from './isUmiUIEnable';

const fixtures = join(__dirname, 'fixtures', 'isUmiUIEnable');

test('ant-design-pro 4', () => {
  expect(isUmiUIEnable(join(fixtures, 'ant-design-pro-4'))).toEqual(true);
});

test('ant-design-pro 2 with dependencies', () => {
  expect(isUmiUIEnable(join(fixtures, 'ant-design-pro-2-dep'))).toEqual(true);
});

test('ant-design-pro 2 with files', () => {
  expect(isUmiUIEnable(join(fixtures, 'ant-design-pro-2-file'))).toEqual(true);
});

test('ant-design-pro 4 with react 15', () => {
  expect(isUmiUIEnable(join(fixtures, 'ant-design-pro-4-react-15'))).toEqual(false);
});

xtest('tech-ui', () => {
  expect(isUmiUIEnable(join(fixtures, 'tech-ui'))).toEqual(true);
});
