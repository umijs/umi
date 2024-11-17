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
import { load } from './context/context';
import { UseDecorator } from './paramDecorator/jsDecorator.js';
import { TsUseDecorator } from './paramDecorator/tsDecorator.ts';
import { foo } from './foo';

console.log(foo);
console.log(bar);
console.log(load);
console.log(UseDecorator, TsUseDecorator);
