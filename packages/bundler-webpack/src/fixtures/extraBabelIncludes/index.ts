// @ts-ignore
import bar from 'bar/bar';
// @ts-ignore
import foo from 'foo/foo';
import hoo from '../.extraBabelIncludes/hoo';
import too from '../.noExtraBabelIncludes/too';

bar();
foo();
hoo();
too();
