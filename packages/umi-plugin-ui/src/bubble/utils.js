// render locale format
export const render = (template, model) =>
  template.replace(/{{ (\w+) }}/g, (str, key) => model[key]);

export const getLocale = () => {
  // support SSR
  const { g_langSeparator = '-', g_lang } = window;
  const lang = typeof localStorage !== 'undefined' ? window.localStorage.getItem('umi_locale') : '';
  const isNavigatorLanguageValid =
    typeof navigator !== 'undefined' && typeof navigator.language === 'string';
  const browserLang = isNavigatorLanguageValid
    ? navigator.language.split('-').join(g_langSeparator)
    : '';
  return lang || g_lang || browserLang || 'zh-CN';
};

export const getScrollOffsets = () => {
  if (window.pageXOffset != null) {
    return {
      x: window.pageXOffset,
      y: window.pageYOffset,
    };
  }

  // For IE (or any browser) in Standards mode
  const { document } = window;
  if (document.compatMode === 'CSS1Compat') {
    return {
      x: document.documentElement.scrollLeft,
      y: document.documentElement.scrollTop,
    };
  }

  return {
    x: document.body.scrollLeft,
    y: document.body.scrollTop,
  };
};

export const getClientHeight = () =>
  window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

export const getClientWidth = () => {
  if (window.innerWidth) {
    return window.innerWidth;
  }
  return document.body.clientWidth;
};

let cached;

export const getScrollBarSize = fresh => {
  if (window.innerWidth > document.body.offsetWidth) {
    if (fresh || cached === undefined) {
      const inner = document.createElement('div');
      inner.style.width = '100%';
      inner.style.height = '200px';

      const outer = document.createElement('div');
      const outerStyle = outer.style;

      outerStyle.position = 'absolute';
      outerStyle.top = 0;
      outerStyle.left = 0;
      outerStyle.pointerEvents = 'none';
      outerStyle.visibility = 'hidden';
      outerStyle.width = '200px';
      outerStyle.height = '150px';
      outerStyle.overflow = 'hidden';

      outer.appendChild(inner);

      document.body.appendChild(outer);

      const widthContained = inner.offsetWidth;
      outer.style.overflow = 'scroll';
      let widthScroll = inner.offsetWidth;

      if (widthContained === widthScroll) {
        widthScroll = outer.clientWidth;
      }

      document.body.removeChild(outer);

      cached = widthContained - widthScroll;
    }
    return cached;
  }
  return 0;
};

let relativeToViewport;

export function isRelativeToViewport() {
  if (relativeToViewport != null) return relativeToViewport;

  const x = window.pageXOffset ? window.pageXOffset + window.innerWidth - 1 : 0;
  const y = window.pageYOffset ? window.pageYOffset + window.innerHeight - 1 : 0;
  if (x === 0 && y === 0) return true;

  // Test with a point larger than the viewport. If it returns an element,
  // then that means elementFromPoint takes page coordinates.
  return relativeToViewport === !document.elementFromPoint(x, y);
}
