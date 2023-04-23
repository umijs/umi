import { join } from 'path';
import { getASTByFilePath } from '../getASTByFilePath/getASTByFilePath';
import { generate } from '../utils/generate';
import { removeConfigByName } from './removeConfigByName';

const fixtures = join(__dirname, '../../fixtures');
const cwd = join(fixtures, 'app');

test('normal', () => {
  const ast = getASTByFilePath(join(cwd, '.umirc.ts'));
  if (!ast) return;
  const generateCode = generate(removeConfigByName(ast, 'abc'));
  expect(generateCode).not.toContain('abc');
});
