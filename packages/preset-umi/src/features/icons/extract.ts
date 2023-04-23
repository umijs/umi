// TODO: check import { Icon } from 'umi' first
// TODO: handle // and /**/
// TODO: handle <Icon /> in string or template literal
// TODO: support <Icon name={`foo`} />
export function extractIcons(code: string) {
  const icons: Set<string> = new Set();
  let current = 0;

  function isIconStart() {
    return (
      code[current] === '<' &&
      code[current + 1] === 'I' &&
      code[current + 2] === 'c' &&
      code[current + 3] === 'o' &&
      code[current + 4] === 'n' &&
      isEmptyChar(code[current + 5])
    );
  }

  let quotationMark: string = '';
  function isIconAttributeStart() {
    if (
      isEmptyChar(code[current]) &&
      code[current + 1] === 'i' &&
      code[current + 2] === 'c' &&
      code[current + 3] === 'o' &&
      code[current + 4] === 'n' &&
      code[current + 5] === '=' &&
      (code[current + 6] === "'" || code[current + 6] === '"')
    ) {
      quotationMark = code[current + 6];
      return true;
    } else {
      return false;
    }
  }

  function isHoverAttributeStart() {
    if (
      isEmptyChar(code[current]) &&
      code[current + 1] === 'h' &&
      code[current + 2] === 'o' &&
      code[current + 3] === 'v' &&
      code[current + 4] === 'e' &&
      code[current + 5] === 'r' &&
      code[current + 6] === '=' &&
      (code[current + 7] === "'" || code[current + 7] === '"')
    ) {
      quotationMark = code[current + 7];
      return true;
    } else {
      return false;
    }
  }

  function isEmptyChar(char: string) {
    // \r is for windows
    return char === ' ' || char === '\n' || char === '\r';
  }

  function findAttributeValue() {
    let value = '';
    while (code[current] !== quotationMark && code[current] !== '>') {
      value += code[current];
      current += 1;
    }
    return value;
  }

  function finishJSXTag() {
    let icon = null;
    while (code[current] !== '>') {
      //  icon="foo"
      if (isIconAttributeStart()) {
        current += 7;
        icon = findAttributeValue();
        if (icon) {
          icons.add(icon);
        }
      }
      // hover=""
      else if (isHoverAttributeStart()) {
        current += 8;
        icon = findAttributeValue();
        if (icon) {
          icons.add(icon);
        }
      } else {
        current += 1;
      }
    }
    if (code[current] === '>') {
      current += 1;
      return;
    }
  }

  while (current < code.length) {
    // <Icon name="foo" />
    if (isIconStart()) {
      current += 5;
      finishJSXTag();
    } else {
      current += 1;
    }
  }
  return Array.from(icons);
}
