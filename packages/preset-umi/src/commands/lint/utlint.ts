import { fork } from 'child_process';
import { dirname, resolve } from 'path';

export async function runUtlint(cwd: string, args: string[]) {
  let binPath: string;
  try {
    const pkgPath = require.resolve('@utoo/lint/package.json', {
      paths: [cwd],
    });
    binPath = resolve(dirname(pkgPath), require(pkgPath).bin['utoo-lint']);
  } catch (err) {
    throw new Error(
      '@utoo/lint is required for umi lint --utlint. Please install it in your project with npm install -D @utoo/lint (Node.js >=20).',
      { cause: err },
    );
  }

  await new Promise<void>((resolve, reject) => {
    fork(binPath, args, {
      cwd,
      stdio: 'inherit',
      env: {
        ...process.env,
        // The migration tool reads rule configs without loading ESLint plugins.
        // Umi's ESLint resolution patch requires a real ESLint caller instead.
        UMI_UTLINT_MIGRATE:
          args[0] === 'migrate' && args[1] === 'eslint' ? '1' : '0',
      },
    })
      .once('error', reject)
      .once('exit', (code, signal) => {
        if (signal) {
          reject(new Error(`utoo-lint was terminated by ${signal}.`));
        } else {
          if (code) process.exitCode = code;
          resolve();
        }
      });
  });
}
