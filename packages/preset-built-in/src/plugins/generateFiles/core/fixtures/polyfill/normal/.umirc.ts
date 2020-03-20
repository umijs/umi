import { join, dirname } from "path";
import pkgUp from 'pkg-up';

export default {
  presets: [
    join(dirname(pkgUp.sync({
      cwd: __dirname
    })!), 'src/index.ts'),
  ],
}
