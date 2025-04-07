import 'zx/globals';
import { Markdown } from './Markdown';

async function generateLLms() {
  const cwd = process.cwd();
  const llmsDir = path.resolve(cwd, '..');
  const docsDir = path.join(cwd, 'docs');

  let docs = await glob('**/*.md', { cwd: docsDir });

  let docsIndex: Array<{ title: string; url: string }> = [];

  for (let markdown of docs) {
    let mdPath = path.join(docsDir, markdown);
    let mdContent = fs.readFileSync(mdPath, 'utf-8');
    let md = new Markdown({ content: mdContent });
    let { attributes, body } = md.parseFrontMatter() as {
      attributes: {
        title: string | null;
      };
      body: string;
    };

    let isEnUS = mdPath.includes('en-US');
    if (!isEnUS) {
      docsIndex.push({
        title: `UmiJS - ${attributes.title || ''}`,
        url: `https://umijs.org/${markdown.replace(/\.md$/, '')}`,
      });
    }
  }
  const docsIndexContent = [
    '# Umi JS - 插件化的企业级前端应用框架',
    '',
    '- Umi是可扩展的企业级前端应用框架。Umi 以路由为基础的，同时支持配置式路由和约定式路由，保证路由的功能完备，并以此进行功能扩展。然后配以生命周期完善的插件体系，覆盖从源码到构建产物的每个生命周期，支持各种功能扩展和业务需求。',
    '',
    '## Docs',
    '',
    ...docsIndex.map(({ title, url }) => `- [${title}](${url})`),
    '',
  ].join('\n');

  fs.writeFileSync(path.join(llmsDir, 'dist/llms.txt'), docsIndexContent);
  console.log('Generated llms.txt');
}
(async () => {
  if (require.main === module) {
    await generateLLms();
  }
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
