// @ts-ignore
import bar from 'bar/bar';
// @ts-ignore
import foo from 'foo/foo';
// @ts-ignore
import pun from 'pkg-up-name';
import hoo from '../.extraBabelIncludes/hoo';
import too from '../.noExtraBabelIncludes/too';

bar();
foo();
pun();
hoo();
too();
