import ejs from 'ejs';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import assert from 'assert';
import cheerio from 'cheerio';
import { IConfig, IRoute } from '..';
import { prettier } from '@umijs/utils';

interface IOpts {
  config: IConfig;
}

interface IMeta {
  [key: string]: string;
}

class Html {
  config: IConfig;
  constructor(opts: IOpts) {
    this.config = opts.config;
  }

  getAsset({ file }: { file: string }) {
    if (/^https?:\/\//.test(file)) {
      return file;
    }
    const publicPath = this.config.publicPath || '/';
    return `${publicPath}${file.charAt(0) === '/' ? file.slice(1) : file}`;
  }

  getContent({
    route,
    metas = [],
    headJSFiles = [],
    jsFiles = [],
    cssFiles = [],
    tplPath,
  }: {
    route: IRoute;
    metas?: IMeta[];
    headJSFiles?: string[];
    jsFiles?: string[];
    cssFiles?: string[];
    tplPath?: string;
  }) {
    const { config } = this;
    if (tplPath) {
      assert(
        existsSync(tplPath),
        `getContent() failed, tplPath of ${tplPath} not exists.`,
      );
    }
    const tpl = readFileSync(
      tplPath || join(__dirname, 'document.ejs'),
      'utf-8',
    );
    const context = {
      config,
    };
    let html = ejs.render(tpl, context, {
      _with: false,
      localsName: 'context',
      filename: 'document.ejs',
    });

    const $ = cheerio.load(html);

    // metas
    metas.forEach(meta => {
      $('head').append(
        [
          '<meta',
          ...Object.keys(meta).reduce((memo, key) => {
            return memo.concat(`${key}="${meta[key]}"`);
          }, [] as string[]),
          '/>',
        ].join(' '),
      );
    });

    // title
    if (config.title && !$('head > title').length) {
      $('head').append('<title>foo</title>');
    }

    // css
    cssFiles.forEach(file => {
      $('head').append(
        `<link rel="stylesheet" href="${this.getAsset({ file })}" />`,
      );
    });

    // root element
    const mountElementId = config.mountElementId || 'root';
    if (!$(`#${mountElementId}`).length) {
      const bodyEl = $('body');
      assert(bodyEl.length, `<body> not found in html template.`);
      bodyEl.append(`<div id="${mountElementId}"></div>`);
    }

    // js
    headJSFiles.forEach(file => {
      $('head').append(`<script src="${this.getAsset({ file })}"></script>`);
    });
    jsFiles.forEach(file => {
      $('body').append(`<script src="${this.getAsset({ file })}"></script>`);
    });

    html = $.html();
    html = prettier.format(html, {
      parser: 'html',
    });

    return html;
  }
}

export default Html;
