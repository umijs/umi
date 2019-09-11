import * as prettier from 'prettier';

/**
 * prettier code
 * @param fileContent file flow string
 * @param parser default typescript
 */
export default function(fileContent: string, parser: string = 'typescript') {
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
