const { yParser, chalk } = require('@umijs/utils');
const { writeFileSync } = require('fs');
const { join, relative } = require('path');

const cwd = join(__dirname, '..');
const args = yParser(process.argv.slice(2));
const command = args._[0];
const docsDir = join(cwd, 'docs');

switch (command) {
  case 'add':
    add({
      path: args._[1],
    });
    break;
  default:
    console.error(chalk(`Unsupported command ${command}`));
    break;
}

function add({ path }) {
  const title = args.title || 'Untitled';
  const content = `---\ntitle: ${title}\n---\n`;
  write({ path: join(docsDir, `${path}.md`), content });
  write({ path: join(docsDir, `${path}.zh-CN.md`), content });
}

function write({ content, path }) {
  console.log(`${chalk.green('Write')} ${relative(cwd, path)}`);
  writeFileSync(path, content, 'utf-8');
}
