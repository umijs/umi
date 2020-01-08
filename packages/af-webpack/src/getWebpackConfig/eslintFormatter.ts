import eslintFormatter from 'react-dev-utils/eslintFormatter';
import chalk from 'chalk';
const path = require('path');

interface Message {
  warningCount: number;
  filePath: string;
}
interface MessageArray {
  [index: number]: Message;
}

export default function(messages: MessageArray) {
  const output = '\n';
  const message = messages[0] || {};
  const warnSource =
    (message as Message).warningCount > 0
      ? `${output}${chalk.bgYellow.black(' warn ')}${chalk(
          ` in ./${path
            .relative(process.cwd(), (message as Message).filePath)
            .split(path.sep)
            .join('/')}`,
        )}${output}`
      : '';
  const result = eslintFormatter(messages);

  return `${warnSource}${result}`;
}
