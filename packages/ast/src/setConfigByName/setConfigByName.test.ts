import { join } from 'path';
import { getASTByFilePath } from '../getASTByFilePath/getASTByFilePath';
import { generate } from '../utils/generate';
import { setConfigByName } from './setConfigByName';

const fixtures = join(__dirname, '../../fixtures');
const cwd = join(fixtures, 'app');

test('normal', () => {
  const ast = getASTByFilePath(join(cwd, '.umirc.ts'));
  if (!ast) return;
  const generateCode = generate(setConfigByName(ast!, 'abc', false)!);
  expect(generateCode).toContain('abc: false');
});

test('set object', () => {
  const ast = getASTByFilePath(join(cwd, '.umirc.ts'));
  if (!ast) return;
  const generateCode = generate(
    setConfigByName(ast, 'p2', JSON.stringify({ react: 'aaa' }))!,
  );
  expect(generateCode).toContain('react');
});

test('set number', () => {
  const ast = getASTByFilePath(join(cwd, '.umirc.ts'));
  if (!ast) return;
  const generateCode = generate(setConfigByName(ast, 'num', 2)!);
  expect(generateCode).toContain('num: 2');
});

test('set array', () => {
  const ast = getASTByFilePath(join(cwd, '.umirc.ts'));
  if (!ast) return;
  const generateCode = generate(
    setConfigByName(ast, 'plugins', JSON.stringify(['./eee', './fff']))!,
  );
  expect(generateCode).toContain('eee');
});

test('set new config', () => {
  const ast = getASTByFilePath(join(cwd, '.umirc.ts'));
  if (!ast) return;
  const generateCode = generate(setConfigByName(ast, 'aaa', true)!);
  expect(generateCode).toContain('aaa');
});
