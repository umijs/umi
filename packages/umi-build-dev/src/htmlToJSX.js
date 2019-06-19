// ref: https://github.com/littlehaker/html-to-jsx/blob/master/index.js
// ref: https://github.com/reactjs/react-magic/blob/master/test/htmltojsx-test.js

class StyleParser {
  constructor(rawStyle) {
    this.parse(rawStyle);
  }

  parse(rawStyle) {
    this.styles = {};
    rawStyle.split(';').forEach(style => {
      style = style.trim();
      const firstColon = style.indexOf(':');
      const key = style.substr(0, firstColon);
      const value = style.substr(firstColon + 1).trim();
      if (key !== '') {
        this.styles[key] = value;
      }
    });
  }

  /**
   * Convert the style information represented by this parser into a JSX
   * string
   *
   * @return {string}
   */
  toJSXString() {
    const output = Object.keys(this.styles).map(key => {
      return `${this.toJSXKey(key)}: ${this.toJSXValue(this.styles[key])}`;
    });
    return output.join(', ');
  }

  /**
   * Convert a hyphenated string to camelCase.
   */
  hyphenToCamelCase(string) {
    return string.replace(/-(.)/g, function(match, chr) {
      return chr.toUpperCase();
    });
  }

  /**
   * Determines if the specified string consists entirely of numeric characters.
   */
  isNumeric(input) {
    return (
      input !== undefined &&
      input !== null &&
      (typeof input === 'number' || parseInt(input, 10) === input)
    );
  }

  /**
   * Convert the CSS style key to a JSX style key
   *
   * @param {string} key CSS style key
   * @return {string} JSX style key
   */
  toJSXKey(key) {
    return this.hyphenToCamelCase(key);
  }

  /**
   * Convert the CSS style value to a JSX style value
   *
   * @param {string} value CSS style value
   * @return {string} JSX style value
   */
  toJSXValue(value) {
    if (this.isNumeric(value)) {
      // If numeric, no quotes
      return value;
    } else {
      // Proably a string, wrap it in quotes
      return `\'${value.replace(/'/g, '"')}\'`;
    }
  }
}

export default function(html) {
  html = html
    .replace(/\sclass=/g, ' className=')
    .replace(/\sfor=/g, ' htmlFor=')
    // replace comments
    .replace(/<!--/g, '{/*')
    .replace(/-->/g, '*/}');

  html = html.replace('<!DOCTYPE html>', '');

  html = html.replace(/<script>([\s\S]+?)<\/script>/g, (a, b) => {
    return `<script dangerouslySetInnerHTML={{ __html: \`${b.trim()}\` }} />`;
  });

  html = html.replace(/<style>([\s\S]+?)<\/style>/g, (a, b) => {
    return `<style dangerouslySetInnerHTML={{ __html: \`${b.trim()}\` }} />`;
  });

  [
    'area',
    'base',
    'br',
    'col',
    'command',
    'embed',
    'hr',
    'img',
    'input',
    'keygen',
    'link',
    'meta',
    'param',
    'source',
    'track',
    'wbr',
  ].forEach(function(tag) {
    const regex = new RegExp(`<(${tag}[^>]*?)>`, 'g');
    html = html.replace(regex, function(_, str) {
      if (str.endsWith('/')) {
        return `<${str}>`;
      } else {
        return `<${str} />`;
      }
    });
  });

  const attrs = [
    'accept',
    'acceptCharset',
    'accessKey',
    'action',
    'allowFullScreen',
    'allowTransparency',
    'alt',
    'async',
    'autoComplete',
    'autoFocus',
    'autoPlay',
    'capture',
    'cellPadding',
    'cellSpacing',
    'charSet',
    'challenge',
    'checked',
    'classID',
    'className',
    'cols',
    'colSpan',
    'content',
    'contentEditable',
    'contextMenu',
    'controls',
    'coords',
    'crossOrigin',
    'data',
    'dateTime',
    'defer',
    'dir',
    'disabled',
    'download',
    'draggable',
    'encType',
    'form',
    'formAction',
    'formEncType',
    'formMethod',
    'formNoValidate',
    'formTarget',
    'frameBorder',
    'headers',
    'height',
    'hidden',
    'high',
    'href',
    'hrefLang',
    'htmlFor',
    'httpEquiv',
    'icon',
    'id',
    'inputMode',
    'keyParams',
    'keyType',
    'label',
    'lang',
    'list',
    'loop',
    'low',
    'manifest',
    'marginHeight',
    'marginWidth',
    'max',
    'maxLength',
    'media',
    'mediaGroup',
    'method',
    'min',
    'minLength',
    'multiple',
    'muted',
    'name',
    'noValidate',
    'open',
    'optimum',
    'pattern',
    'placeholder',
    'poster',
    'preload',
    'radioGroup',
    'readOnly',
    'rel',
    'required',
    'role',
    'rows',
    'rowSpan',
    'sandbox',
    'scope',
    'scoped',
    'scrolling',
    'seamless',
    'selected',
    'shape',
    'size',
    'sizes',
    'span',
    'spellCheck',
    'src',
    'srcDoc',
    'srcSet',
    'start',
    'step',
    'style',
    'summary',
    'tabIndex',
    'target',
    'title',
    'type',
    'useMap',
    'value',
    'width',
    'wmode',
    'wrap',
  ];

  // replace attrNames
  attrs.forEach(function(attr) {
    const originAttr = attr.toLowerCase();
    const regex = new RegExp(`\\s${originAttr}=`, 'g');
    html = html.replace(regex, ` ${attr}=`);
  });

  // replace styles
  html = html.replace(/\sstyle="(.+?)"/g, function(attr, styles) {
    const jsxStyles = new StyleParser(styles).toJSXString();
    return ` style={{${jsxStyles}}}`;
  });

  return html;
}
