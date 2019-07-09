import * as prettier from 'prettier';

export default function(fileContent, parser = 'typescript') {
  try {
    return prettier.format(fileContent, {
      parser,
      trailingComma: 'all',
      singleQuote: true,
    });
  } catch (e) {
    console.error(`代码格式化报错！${e.toString()}\n代码为：${fileContent}`);
    return fileContent;
  }
}
