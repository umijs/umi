// @ts-ignore
import { connect } from 'dva';
import { useAppData, request } from 'umi';
test('import from umi works', () => {
  expect(useAppData).toBeDefined();
  expect(connect).toBeDefined();
});

test('import request from umi works', () => {
  expect(request).toBeTruthy();
  request(`https://registry.npmjs.com/umi/2.0.0`);
});
