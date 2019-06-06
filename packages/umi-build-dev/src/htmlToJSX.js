// ref: https://github.com/littlehaker/html-to-jsx/blob/master/index.js

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

  return html;
}
