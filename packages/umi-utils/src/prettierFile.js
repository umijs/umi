import * as prettier from 'prettier';

export default function(fileContent, parser = 'typescript') {
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
