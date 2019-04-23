import prettier from 'prettier';

export default function(code, { placeholder, content }) {
  const newCode = code.replace(placeholder, content);

  return prettier.format(newCode, {
    singleQuote: true,
    trailingComma: 'es5',
    printWidth: 100,
    parser: 'babylon',
  });
}
