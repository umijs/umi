import assert from 'assert';

export type IStyle =
  | string
  | {
      src?: string;
      content?: string;
    };

export function normalizeStyles(scripts: IStyle[]) {
  return scripts.map(normalizeStyle);
}

const RE_URL = /^(http:|https:)?\/\//;

export function normalizeStyle(style: IStyle) {
  if (typeof style === 'string') {
    const isUrl =
      RE_URL.test(style) ||
      (style.startsWith('/') && !style.startsWith('/*')) ||
      style.startsWith('./') ||
      style.startsWith('../');
    return isUrl
      ? {
          src: style,
        }
      : { content: style };
  } else if (typeof style === 'object') {
    assert(
      typeof style.src === 'string' || typeof style.content === 'string',
      `Style must have either a "src" or a "content" property.`,
    );
    return style;
  } else {
    throw new Error(`Invalid style type: ${typeof style}`);
  }
}
