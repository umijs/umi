import { chalk, winPath } from '@umijs/utils';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { IApi } from '../../types';

function checkBinExists(binName: string): boolean {
  try {
    const command =
      process.platform === 'win32' ? `where ${binName}` : `which ${binName}`;
    execSync(command, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

export default (api: IApi) => {
  api.describe({
    key: 'aiDev',
  });

  api.onDevCompileDone((args) => {
    // mako and utoopack don't support fetch error stats
    if (api.config.mako || api.config.utoopack) {
      return;
    }
    if (!process.env.UMI_AI_COMMAND || !process.env.UMI_AI_PACKAGE) return;

    try {
      const aiCommand = process.env.UMI_AI_COMMAND;
      const aiPackage = process.env.UMI_AI_PACKAGE;
      const aiCommandExists = checkBinExists(aiCommand);
      const npmClient = api.appData.npmClient;

      const hasErrors = args.stats?.hasErrors?.() || false;
      if (hasErrors) {
        const errorStats = args.stats.toString();
        const errorFilePath = path.join(api.paths.absTmpPath, 'devError.txt');
        const relativeErrorFilePath = winPath(
          path.relative(api.paths.cwd, errorFilePath),
        );
        const prefix = aiCommandExists
          ? ''
          : `${npmClient} install -g ${aiPackage} && `;

        try {
          fs.writeFileSync(errorFilePath, errorStats);
          console.log();
          console.log(chalk.red('🤖 AI Dev: Compilation errors detected!'));
          console.log(`Error details saved to: ${errorFilePath}`);
        } catch (err) {
          console.log();
          console.log(chalk.red('🤖 AI Dev: Compilation errors detected!'));
          console.log(chalk.yellow('⚠️  Could not save error details'));
        }
        console.log(
          chalk.yellow(
            `💡 Suggestion: Run \`${prefix}${aiCommand} "fix error in ${relativeErrorFilePath}"\` to get AI assistance`,
          ),
        );
        console.log();
      }
    } catch (err) {
      console.log(`[AI Dev] Error: ${err}`);
    }
  });
};
