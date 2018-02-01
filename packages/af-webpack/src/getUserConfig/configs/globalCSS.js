import assert from 'assert';
import { extname } from 'path';

export default function() {
  return {
    name: 'globalCSS',
    validate(val) {
      assert(
        Array.isArray(val),
        `The globalCSS config must be Array, but got ${val}`,
      );
      val.forEach(file => {
        const ext = extname(file).toLowerCase();
        assert(
          ext === '.css' || ext === '.less',
          `Items in the globalCSS config must end with .css or .less, but got ${file}`,
        );
      });
    },
  };
}
