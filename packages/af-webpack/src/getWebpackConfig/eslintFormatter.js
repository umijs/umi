import eslintFormatter from 'react-dev-utils/eslintFormatter';
import chalk from 'chalk';
const path = require('path');

export default function(results) {
  const output = '\n';
  const message = results[0] || {};
  const warnSource =
    message.warningCount > 0
      ? `${output}${chalk.bgYellow.black(' warn ')}${chalk(
          ` in ./${path
            .relative(process.cwd(), message.filePath)
            .split(path.sep)
            .join('/')}`,
        )}${output}`
      : '';
  const result = eslintFormatter(results);

  return `${warnSource}${result}`;
}
