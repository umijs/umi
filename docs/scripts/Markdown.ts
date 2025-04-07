import frontMatter from 'front-matter';
import anchor from 'markdown-it-anchor';
import Shikiji from 'markdown-it-shikiji';

interface MarkdownOpts {
  content: string;
}

export class Markdown {
  #opts: MarkdownOpts;
  constructor(opts: MarkdownOpts) {
    this.#opts = opts;
  }

  parseFrontMatter() {
    const { attributes, body } = frontMatter(this.#opts.content);
    return {
      attributes,
      body,
    };
  }

  static async parseMarkdown(body: string) {
    const MarkdownIt = require('markdown-it');
    const md = new MarkdownIt({
      html: true,
      linkify: true,
      typographer: true,
    });
    md.use(
      await Shikiji({
        // themes: https://github.com/shikijs/shiki/blob/main/docs/themes.md
        theme: 'github-light',
      }),
    );
    md.use(anchor, {
      permalink: anchor.permalink.linkInsideHeader({
        symbol: `
          <span aria-hidden="true">#</span>
        `,
        placement: 'after',
      }),
    });
    let html = md.render(body);
    return html;
  }

  static generateMarkdown(attributes: any, body: string) {
    const yaml = require('js-yaml');
    let yamlStr = yaml.dump(attributes, {});
    const result = `---\n${yamlStr}---\n\n${body}\n`;
    return result;
  }
}
