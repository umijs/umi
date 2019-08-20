function getLangStr(obj, lang) {
  if (typeof obj === 'string') {
    return obj;
  } else if (typeof obj === 'object') {
    return obj[lang] || obj['en-US'];
  } else {
    throw new Error(`Unsupport type ${typeof obj}`);
  }
}

function normalizeAction(action, lang) {
  return {
    ...action,
    title: getLangStr(action.title, lang),
  };
}

export default class ActiveProjectError extends Error {
  actions: any;

  constructor(opts) {
    const { message, stack, actions, lang } = opts;
    super(getLangStr(message, lang));
    if (stack) this.stack = stack;
    if (actions)
      this.actions = actions.map(action => {
        return normalizeAction(action, lang);
      });
  }
}
