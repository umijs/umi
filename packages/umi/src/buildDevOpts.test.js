import { join } from 'path';
import buildDevOpts from './buildDevOpts';

describe('buildDevOpts', () => {
  test('parse', () => {
    const fixtures = join(__dirname, 'fixtures', 'buildDevOpts');
    const oldCwd = process.cwd;
    process.cwd = () => {
      return fixtures;
    };
    buildDevOpts();
    process.cwd = oldCwd;

    expect(process.env.ENV_A).toEqual('test');
    expect(process.env.ENV_B).toEqual('http://localhost:8002/');
    expect(process.env.ENV_C).toEqual('8003');
  });
});
