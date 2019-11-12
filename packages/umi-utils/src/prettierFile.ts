import * as prettier from 'prettier';

type PrettierFormatParser =
  | 'babel'
  | 'babel-flow'
  | 'flow'
  | 'typescript'
  | 'css'
  | 'scss'
  | 'less'
  | 'json'
  | 'json5'
  | 'json-stringify'
  | 'graphql'
  | 'markdown'
  | 'mdx'
  | 'html'
  | 'lwc'
  | 'yaml';
/**
 * prettier code
 * @param fileContent file flow string
 * @param parser default typescript
 */
export default function(fileContent: string, parser: PrettierFormatParser = 'typescript'): string {
  try {
    return prettier.format(fileContent, {
      parser,
      trailingComma: 'all',
      singleQuote: true,
    });
  } catch (e) {
    console.error(`prettier error！${e.toString()}\n code：${fileContent}`);
    return fileContent;
  }
}
