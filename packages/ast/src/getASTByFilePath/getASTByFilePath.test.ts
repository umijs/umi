import { join } from 'path';
import { getASTByFilePath } from './getASTByFilePath';

const fixtures = join(__dirname, '../../fixtures');
const cwd = join(fixtures, 'app');

test('normal', () => {
  const props = getASTByFilePath(join(cwd, '.umirc.ts'));
  if (props) {
    expect(props.type).toEqual('File');
  }
});

test('no found', () => {
  const props = getASTByFilePath(join(cwd, '.umirc1.ts'));
  expect(props).toBe(null);
});
