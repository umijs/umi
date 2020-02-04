import { join } from 'path';
import { readFileSync, writeFileSync } from 'fs';
import Service from '../../../../umi-build-dev/src/Service';
import { formatConfigs, useConfigKey } from './index';

const fixtures = join(__dirname, 'fixtures');

test('org.umi.config.list', async () => {
  return new Promise((resolve, reject) => {
    const service = new Service({
      cwd: join(fixtures, 'normal'),
    });
    service.init();
    service.applyPlugins('onUISocket', {
      args: {
        action: { type: 'org.umi.config.list' },
        success({ data }) {
          expect(Array.isArray(data)).toEqual(true);
          expect(data.length > 1).toEqual(true);
          resolve();
        },
        failure(e) {
          reject(e);
        },
      },
    });
  });
});

test('org.umi.config.edit', async () => {
  return new Promise((resolve, reject) => {
    const service = new Service({
      cwd: join(fixtures, 'normal'),
    });
    service.init();
    service.applyPlugins('onUISocket', {
      args: {
        action: {
          type: 'org.umi.config.edit',
          payload: {
            key: 'history',
            value: 'hash',
          },
        },
        success() {
          const configFile = join(fixtures, 'normal', '.umirc.js');
          const newConfig = readFileSync(configFile, 'utf-8');
          expect(newConfig.trim()).toEqual(
            `
export default {
  history: 'hash',
};
          `.trim(),
          );
          writeFileSync(configFile, `export default {}`, 'utf-8');
          resolve();
        },
        failure(e) {
          reject(e);
        },
      },
    });
  });
});

test('useConfigKey', () => {
  expect(
    useConfigKey(
      {
        a: 'b',
      },
      'a',
    ),
  ).toEqual([true, 'b']);
});

test('useConfigKey a.b.c', () => {
  expect(
    useConfigKey(
      {
        a: { b: { c: 'd' } },
      },
      'a.b.c',
    ),
  ).toEqual([true, 'd']);
});

test('useConfigKey a.b', () => {
  expect(
    useConfigKey(
      {
        a: { b: { c: 'd' } },
      },
      'a.b',
    ),
  ).toEqual([true, { c: 'd' }]);
});

test('useConfigKey not found a.b.d', () => {
  expect(
    useConfigKey(
      {
        a: { b: { c: 'd' } },
      },
      'a.b.d',
    ),
  ).toEqual([false]);
});

test('useConfigKey not found', () => {
  expect(
    useConfigKey(
      {
        a: 'b',
      },
      'b',
    ),
  ).toEqual([false]);
});

test('formatConfigs', () => {
  expect(formatConfigs([{ name: 'a' }])).toEqual([]);
});

test('formatConfigs match with type', () => {
  expect(formatConfigs([{ name: 'a', type: 'string' }])).toEqual([
    { group: 'Ungrouped', name: 'a', type: 'string' },
  ]);
});

test('formatConfigs match filter props', () => {
  expect(formatConfigs([{ name: 'a', type: 'string', foo: 'bar' }])).toEqual([
    { group: 'Ungrouped', name: 'a', type: 'string' },
  ]);
});

test('formatConfigs match with lang', () => {
  expect(
    formatConfigs(
      [
        {
          name: 'a',
          type: 'string',
          title: {
            'zh-CN': 'abc',
            'en-US': 'cde',
          },
        },
      ],
      {
        lang: 'zh-CN',
      },
    ),
  ).toEqual([{ group: '未分组', name: 'a', type: 'string', title: 'abc' }]);
});

test('formatConfigs match with type (multiple)', () => {
  expect(
    formatConfigs([{ name: 'a', type: 'foo' }, { name: 'b', type: 'bar' }, { name: 'c' }]),
  ).toEqual([
    { group: 'Ungrouped', name: 'a', type: 'foo' },
    { group: 'Ungrouped', name: 'b', type: 'bar' },
  ]);
});

test('formatConfigs child configs', () => {
  expect(
    formatConfigs([
      { name: 'a', configs: [{ name: 'a.b', type: 'foo' }, { name: 'a.c', type: 'bar' }] },
    ]),
  ).toEqual([
    { group: 'Ungrouped', name: 'a.b', type: 'foo' },
    { group: 'Ungrouped', name: 'a.c', type: 'bar' },
  ]);
});
