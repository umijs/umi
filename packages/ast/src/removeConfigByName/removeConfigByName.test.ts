import { join } from 'path';
import { getASTByFilePath } from '../getASTByFilePath/getASTByFilePath';
import { generate } from '../utils/generate';
import { parse } from '../utils/parse';
import { removeConfigByName } from './removeConfigByName';

const fixtures = join(__dirname, '../../fixtures');
const cwd = join(fixtures, 'app');

test('normal', () => {
  const ast = getASTByFilePath(join(cwd, '.umirc.ts'));
  if (!ast) return;
  const generateCode = generate(removeConfigByName(ast, 'abc'));
  expect(generateCode).not.toContain('abc');
});

test('removes only the top-level key and preserves other references', () => {
  const ast = parse(
    "const title = 'Unrelated'; export default { routes: [{ title }], title: 'App' };",
  );
  expect(generate(removeConfigByName(ast, 'title'))).toBe(
    generate(
      parse(
        "const title = 'Unrelated'; export default { routes: [{ title }] };",
      ),
    ),
  );
});

test('removes a shorthand top-level property without changing its variable', () => {
  const ast = parse(
    'const routes = []; export default defineConfig({ routes });',
  );
  expect(generate(removeConfigByName(ast, 'routes'))).toBe(
    generate(parse('const routes = []; export default defineConfig({});')),
  );
});

test('removes a quoted key but leaves same-named computed expressions alone', () => {
  const ast = parse(
    "const hash = 'alias'; export default { [hash]: true, 'hash': false };",
  );
  expect(generate(removeConfigByName(ast, 'hash'))).toBe(
    generate(parse("const hash = 'alias'; export default { [hash]: true };")),
  );
});

test('removing an absent top-level key does not change nested keys', () => {
  const ast = parse("export default { routes: [{ title: 'Home' }] };");
  const before = generate(ast);
  expect(generate(removeConfigByName(ast, 'title'))).toBe(before);
});

test('rejects an unsupported export without removing unrelated declarations', () => {
  const ast = parse("const title = 'Other'; export default makeConfig();");
  const before = generate(ast);
  expect(() => removeConfigByName(ast, 'title')).toThrow(
    "Can't modify config file",
  );
  expect(generate(ast)).toBe(before);
});
