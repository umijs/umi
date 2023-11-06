import { winPath } from '@umijs/utils';
import { join } from 'path';
import { transform } from './transform';

const fixturesDir = join(__dirname, '../../../fixtures');

test('transform selector', async () => {
  const result = await transform(
    `
html {}
.a {}
#b {}
div {}
@media (max-width: 100px) {
  .b {}
}
  `,
    '/foo/bar/hoo.css',
  );
  expect(result).toEqual(`
html:first-child {}
body .a {}
body #b {}
body div {}
@media (max-width: 100px) {
  body .b {}
}
  `);
});

test('transform import', async () => {
  const filePath = join(fixturesDir, 'overrides/normal/foo/bar/hoo.css');
  const result = await transform(
    `
@import "a";
@import "~b";
@import "./a.css";
@import './a.css';
@import "../a.css";
@import "../not-exists.css";
@import "a.css";
@import "child/a.css";
@import "child/not-exists.css";
  `,
    filePath,
  );
  expect(result.replace(new RegExp(`${winPath(fixturesDir)}`, 'g'), ''))
    .toEqual(`
@import "a";
@import "~b";
@import "/overrides/normal/foo/bar/a.css";
@import "/overrides/normal/foo/bar/a.css";
@import "/overrides/normal/foo/a.css";
@import "../not-exists.css";
@import "/overrides/normal/foo/bar/a.css";
@import "/overrides/normal/foo/bar/child/a.css";
@import "child/not-exists.css";
  `);
});

test('transform import with url', async () => {
  const filePath = join(fixturesDir, 'overrides/normal/foo/bar/hoo.css');
  const result = await transform(
    `
@import url("a.css");
@import url('a.css');
@import url(a.css);
@import url(not-exists.css);
  `,
    filePath,
  );
  expect(result.replace(new RegExp(`${winPath(fixturesDir)}`, 'g'), ''))
    .toEqual(`
@import "/overrides/normal/foo/bar/a.css";
@import "/overrides/normal/foo/bar/a.css";
@import "/overrides/normal/foo/bar/a.css";
@import url(not-exists.css);
  `);
});
