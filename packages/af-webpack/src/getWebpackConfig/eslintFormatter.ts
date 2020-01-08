import eslintFormatter from 'react-dev-utils/eslintFormatter';
import chalk from 'chalk';
import * as path from 'path';

interface Message {
  warningCount: number;
  filePath: string;
}

interface MessageArray extends Array<Message> {}

export default function(messages: MessageArray) {
  const output = '\n';
  const [message = {}] = messages || [];
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
