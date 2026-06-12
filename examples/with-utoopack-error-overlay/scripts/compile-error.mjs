import fs from 'node:fs';
import path from 'node:path';

const mode = process.argv[2];
const file = path.join(import.meta.dirname, '../pages/index.less');

const validStyle = `.page {
  min-height: 100vh;
  padding: 48px;
  color: #1f2328;
  background: #f6f8fa;
}

.page h1 {
  margin: 0 0 16px;
  font-size: 32px;
}

.page p {
  margin: 0;
  font-size: 16px;
}

.page code {
  padding: 2px 6px;
  border-radius: 4px;
  background: rgba(31, 35, 40, 0.08);
}
`;

const brokenStyle = validStyle.replace(
  'background: #f6f8fa;',
  'background: @missing-overlay-color;',
);

if (mode === 'trigger') {
  fs.writeFileSync(file, brokenStyle);
  console.log('Triggered Less compile error in pages/index.less.');
} else if (mode === 'fix') {
  fs.writeFileSync(file, validStyle);
  console.log('Restored pages/index.less.');
} else {
  console.error('Usage: node ./scripts/compile-error.mjs <trigger|fix>');
  process.exit(1);
}
