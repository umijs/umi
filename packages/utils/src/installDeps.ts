import { existsSync } from 'fs';
import { join } from 'path';
import * as execa from '../compiled/execa';

interface IInstallDeps {
  devDependencies?: string[];
  dependencies?: string[];
}

function installDeps({
  opts,
  cwd = process.cwd(),
}: {
  opts: IInstallDeps;
  cwd?: string;
}) {
  const { dependencies, devDependencies } = opts;
  const useYarn =
    existsSync(join(cwd, 'yarn.lock')) ||
    existsSync(join(process.cwd(), 'yarn.lock'));
  const usePnpm =
    existsSync(join(cwd, 'pnpm-workspace.yaml')) ||
    existsSync(join(process.cwd(), 'pnpm-workspace.yaml'));
  const runNpm = useYarn ? 'yarn' : usePnpm ? 'pnpm' : 'npm';
  const install = useYarn || usePnpm ? 'add' : 'install';
  const devTag = useYarn || usePnpm ? '--D' : '--save-dev';
  const installDependencies = (
    deps: string[],
    npmStr: string,
    insStr: string,
    devStr?: string,
  ) => {
    console.log(`${npmStr} install dependencies packages:${deps.join(' ')}`);
    execa.execaCommandSync(
      [npmStr, insStr, devStr]
        .concat(deps)
        .filter((n) => n)
        .join(' '),
      {
        encoding: 'utf8',
        cwd,
        env: {
          ...process.env,
        },
        stderr: 'pipe',
        stdout: 'pipe',
      },
    );
    console.log(`install dependencies packages success`);
  };
  if (dependencies) {
    installDependencies(dependencies, runNpm, install);
  }
  if (devDependencies) {
    installDependencies(devDependencies, runNpm, install, devTag);
  }
}
export default installDeps;
