import ejs from 'ejs';
import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import assert from 'assert';
import { cheerio } from '@umijs/utils';
import prettier from 'prettier';
import { IConfig } from '..';
import { IOpts, IGetContentArgs, IScript } from './types';

class Html {
  config: IConfig;
  tplPath?: string;

  constructor(opts: IOpts) {
    this.config = opts.config;
    this.tplPath = opts.tplPath;
  }

  getHtmlPath(path: string) {
    if (path === '/') {
      return 'index.html';
    }

    // remove first and last slash
    path = path.replace(/^\//, '');
    path = path.replace(/\/$/, '');

    if (this.config.exportStatic?.htmlSuffix || path === 'index.html') {
      return `${path}`;
    } else {
      return `${path}/index.html`;
    }
  }

  getRelPathToPublicPath(path: string) {
    const htmlPath = this.getHtmlPath(path);
    const len = htmlPath.split('/').length;
    return (
      Array(this.config.exportStatic?.htmlSuffix ? len : len - 1).join('../') ||
      './'
    );
  }

  getAsset(opts: { file: string; path?: string }) {
    if (/^https?:\/\//.test(opts.file)) {
      return opts.file;
    }
    const file = opts.file.charAt(0) === '/' ? opts.file.slice(1) : opts.file;
    if (this.config.exportStatic?.dynamicRoot) {
      return `${this.getRelPathToPublicPath(opts.path || '/')}${file}`;
    } else {
      return `${this.config.publicPath}${file}`;
    }
  }

  getScriptsContent(scripts: IScript[]) {
    return scripts
      .map((script: any) => {
        const { content, ...attrs } = script;
        if (content && !attrs.src) {
          const newAttrs = Object.keys(attrs).reduce(
            (memo: any, key: string) => {
              return [...memo, `${key}="${attrs[key]}"`];
            },
            [],
          );
          return [
            `<script${newAttrs.length ? ' ' : ''}${newAttrs.join(' ')}>`,
            content
              .split('\n')
              .map((line: any) => `  ${line}`)
              .join('\n'),
            '</script>',
          ].join('\n');
        } else {
          const newAttrs = Object.keys(attrs).reduce((memo: any, key: any) => {
            return [...memo, `${key}="${attrs[key]}"`];
          }, []);
          return `<script ${newAttrs.join(' ')}></script>`;
        }
      })
      .join('\n');
  }

  async getContent(args: IGetContentArgs): Promise<string> {
    const { route, tplPath = this.tplPath } = args;
    let {
      metas = [],
      links = [],
      styles = [],
      headJSFiles = [],
      headScripts = [],
      scripts = [],
      jsFiles = [],
      cssFiles = [],
    } = args;
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
      // 不输出多个 HTML 时 route 无意义
      ...(config.exportStatic ? { route } : {}),
    };
    let html = ejs.render(tpl, context, {
      _with: false,
      localsName: 'context',
      filename: 'document.ejs',
    });

    let $ = cheerio.load(html);

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

    // links
    links.forEach(link => {
      $('head').append(
        [
          '<link',
          ...Object.keys(link).reduce((memo, key) => {
            return memo.concat(`${key}="${link[key]}"`);
          }, [] as string[]),
          '/>',
        ].join(' '),
      );
    });

    // styles
    styles.forEach(style => {
      const { content = '', ...attrs } = style;
      const newAttrs = Object.keys(attrs).reduce((memo, key) => {
        return memo.concat(`${key}="${attrs[key]}"`);
      }, [] as string[]);
      $('head').append(
        [
          `<style${newAttrs.length ? ' ' : ''}${newAttrs.join(' ')}>`,
          content
            .split('\n')
            .map(line => `  ${line}`)
            .join('\n'),
          '</style>',
        ].join('\n'),
      );
    });

    // css
    cssFiles.forEach(file => {
      $('head').append(
        `<link rel="stylesheet" href="${this.getAsset({
          file,
          path: route.path,
        })}" />`,
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
    if (headScripts.length) {
      $('head').append(this.getScriptsContent(headScripts));
    }
    headJSFiles.forEach(file => {
      $('head').append(
        `<script src="${this.getAsset({ file, path: route.path })}"></script>`,
      );
    });
    if (scripts.length) {
      $('body').append(this.getScriptsContent(scripts));
    }
    jsFiles.forEach(file => {
      $('body').append(
        `<script src="${this.getAsset({ file, path: route.path })}"></script>`,
      );
    });

    if (args.modifyHTML) {
      $ = await args.modifyHTML($, { route });
    }

    html = $.html();
    html = prettier.format(html, {
      parser: 'html',
    });

    return html;
  }
}

export default Html;
