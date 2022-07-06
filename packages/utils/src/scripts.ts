import assert from 'assert';

export type IScript =
  | string
  | {
      src?: string;
      content?: string;
    };

export function normalizeScripts(scripts: IScript[]) {
  return scripts.map(normalizeScript);
}

const RE_URL = /^(http:|https:)?\/\//;

export function normalizeScript(script: IScript) {
  if (typeof script === 'string') {
    const isUrl =
      RE_URL.test(script) ||
      (script.startsWith('/') && !script.startsWith('/*')) ||
      script.startsWith('./') ||
      script.startsWith('../');
    return isUrl
      ? {
          src: script,
        }
      : { content: script };
  } else if (typeof script === 'object') {
    assert(
      typeof script.src === 'string' || typeof script.content === 'string',
      `Script must have either a "src" or a "content" property.`,
    );
    return script;
  } else {
    throw new Error(`Invalid script type: ${typeof script}`);
  }
}
