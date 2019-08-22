import { IUi } from 'umi-types';

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

interface IAction {
  browserHandler?: string;
  buttonType?: string;
  title: IUi.Locale;
  handler?: IUi.IAction;
}

interface IOpts {
  lang: IUi.ILang;
  actions?: IAction[];
  exception?: boolean;
  stack?: string;
  message?: IUi.Locale;
}

export default class ActiveProjectError extends Error {
  actions: IAction[];

  exception: boolean;

  constructor(opts: IOpts) {
    const { message, stack, actions, lang, exception } = opts;
    console.log('optsopts', opts);
    super(getLangStr(message, lang));
    if (stack) this.stack = stack;
    if (exception) {
      console.log('exception', this.exception);
      this.exception = exception;
    }
    if (actions)
      this.actions = actions.map(action => {
        return normalizeAction(action, lang);
      });
  }
}
