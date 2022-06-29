// @ts-ignore
import { connect } from 'dva';
import { useAppData } from 'umi';

test('import from umi works', () => {
  expect(useAppData).toBeDefined();
  expect(connect).toBeDefined();
});
