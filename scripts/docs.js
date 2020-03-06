const { yParser, chalk, glob, lodash } = require('@umijs/utils');
const { writeFileSync, readFileSync, existsSync } = require('fs');
const { join, relative } = require('path');
const parseDoc = require('./utils/parseDoc');

const cwd = join(__dirname, '..');
const args = yParser(process.argv.slice(2));
const command = args._[0];
const docsDir = join(cwd, 'docs');

// 以下文档已翻译，无需同步中文版为英文版
const DOC_SYNC_BLACKLIST = [
  'README.zh-CN.md',
  'docs/README.zh-CN.md',
  'docs/how-umi-works.zh-CN.md',
  'docs/getting-started.zh-CN.md',
  'docs/config.zh-CN.md',
  'docs/directory-structure.zh-CN.md',
];

switch (command) {
  case 'add':
    add({
      path: args._[1],
    });
    break;
  case 'syncDocs':
    syncDocs();
    break;
  case 'syncDoc':
    syncDoc({
      path: args._[1],
    });
    break;
  default:
    console.error(chalk(`Unsupported command ${command}`));
    break;
}

function syncDocs() {
  const files = glob.sync('**/*.zh-CN.md', {
    cwd: join(__dirname, '../docs'),
  });
  const pulledFiles = lodash.pullAll(files, DOC_SYNC_BLACKLIST);
  pulledFiles.forEach(path => {
    syncDoc({ path });
  });
}

function syncDoc({ path }) {
  const base = join(cwd, 'docs');
  const relTargetPath = path.replace(/\.zh-CN\.md/, '.md');
  console.log(
    `${chalk.green('Sync')} ${path} ${chalk.gray('to')} ${relTargetPath}`,
  );
  const source = join(base, path);
  const target = join(base, relTargetPath);

  const sourceDoc = parseDoc(readFileSync(source, 'utf-8'));
  let targetDoc = existsSync(target)
    ? parseDoc(readFileSync(target, 'utf-8'))
    : {
        yamlConfig: [],
      };

  targetDoc.body = sourceDoc.body;
  if (!targetDoc.yamlConfig.includes('translateHelp: true')) {
    targetDoc.yamlConfig = [...targetDoc.yamlConfig, 'translateHelp: true'];
  }
  if (!targetDoc.title && sourceDoc.title) {
    targetDoc.title = sourceDoc.title;
  }

  const content = `---
${targetDoc.yamlConfig.join('\n')}
---

${targetDoc.title ? `# ${targetDoc.title}` : ''}

${targetDoc.body.join('\n')}
`;
  writeFileSync(target, content, 'utf-8');
}

function add({ path }) {
  const title = args.title || 'Untitled';
  const content = `# ${title}\n`;
  write({ path: join(docsDir, `${path}.md`), content });
  write({ path: join(docsDir, `${path}.zh-CN.md`), content });
}

function write({ content, path }) {
  console.log(`${chalk.green('Write')} ${relative(cwd, path)}`);
  writeFileSync(path, content, 'utf-8');
}
