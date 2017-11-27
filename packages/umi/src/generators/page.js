import assert from 'assert';
import ejs from 'ejs';
import uppercamelcase from 'uppercamelcase';
import { join, basename } from 'path';
import { existsSync, statSync, readFileSync, writeFileSync } from 'fs';

function directoryExists(path) {
  return existsSync(path) && statSync(path).isDirectory();
}

function fileExists(path) {
  return existsSync(path) && statSync(path).isFile();
}

function stripEmptyLine(content) {
  const ret = content
    .trim()
    // 两行 -> 一行
    .replace(/\n\n/g, '\n');

  // 结尾空行
  return `${ret}\n`;
}

export default function(opts = {}) {
  const { file } = opts;
  assert(
    !('isDirectory' in opts) || typeof opts.isDirectory === 'boolean',
    'opts.isDirectory should be boolean',
  );
  assert(
    !('useClass' in opts) || typeof opts.useClass === 'boolean',
    'opts.useClass should be boolean',
  );
  const isDirectory = opts.isDirectory || false;
  const cwd = opts.cwd || process.cwd();

  console.log(`[DEBUG] generate page ${file} with isDirectory ${isDirectory}`);

  let cssTargetPath;
  let jsTargetPath;

  if (isDirectory) {
    assert(
      !directoryExists(join(cwd, 'src', 'page', file)),
      `directory src/page/${file} exists`,
    );
    jsTargetPath = join(cwd, 'src', 'page', file, 'page.js');
    cssTargetPath = join(cwd, 'src', 'page', file, 'page.css');
  } else {
    jsTargetPath = join(cwd, 'src', 'page', `${file}.js`);
    cssTargetPath = join(cwd, 'src', 'page', `${file}.css`);
  }

  assert(!fileExists(jsTargetPath), `file src/page/${file} exists`);
  assert(!fileExists(cssTargetPath), `file src/page/${file} exists`);

  const jsTpl = readFileSync(
    join(__dirname, '../../template/page.js'),
    'utf-8',
  );
  const cssTpl = readFileSync(
    join(__dirname, '../../template/page.css'),
    'utf-8',
  );

  const fileName = basename(file);
  const componentName = uppercamelcase(fileName);
  const jsContent = ejs.render(
    jsTpl,
    {
      useClass: opts.useClass,
      fileName,
      componentName,
    },
    {
      _with: false,
      localsName: 'umi',
    },
  );

  const cssContent = ejs.render(
    cssTpl,
    {},
    {
      _with: false,
      localsName: 'umi',
    },
  );

  writeFileSync(jsTargetPath, stripEmptyLine(jsContent), 'utf-8');
  writeFileSync(cssTargetPath, stripEmptyLine(cssContent), 'utf-8');
}
