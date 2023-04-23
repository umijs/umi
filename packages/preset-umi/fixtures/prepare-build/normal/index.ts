// dep imports should be external
import 'foo';
import 'foo/bar';
// deep dep imports ends with .ts also should be external
import 'foo/bar.ts';
// all local imports besides ts and js should be external
import './a.ext-must-not-exist';
import './a.html';
// relative imports
import { bar } from './bar/bar';
import { foo } from './foo';
console.log(foo);
console.log(bar);
