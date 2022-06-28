import parseImport from './importParser';

test('export from some', () => {
  const exportsImports = parseImport(`
export * from 'antd';
export * as name1 from 'antd'; // ECMAScript 2020
export { name1, name2, nameN } from 'antd';
export { import1 as name1, import2 as name2 } from 'antd';
export { default  } from  'antd';
`);

  expect(exportsImports).toMatchInlineSnapshot(`
    Array [
      Object {
        "from": "antd",
        "imports": Array [
          "*",
        ],
      },
      Object {
        "from": "antd",
        "imports": Array [
          "*",
        ],
      },
      Object {
        "from": "antd",
        "imports": Array [
          "name1",
          "name2",
          "nameN",
        ],
      },
      Object {
        "from": "antd",
        "imports": Array [
          "import1",
          "import2",
        ],
      },
      Object {
        "from": "antd",
        "imports": Array [
          "default",
        ],
      },
    ]
  `);
});

test('import parse with all casese', () => {
  const imports = parseImport(`
import defaultExport /* the default import */ from "module-name";  // comment
import * as name from "module-name"; // intended comments 
import { export1 } from "module-name";
import { export1 as alias1 } from "module-name";
import { export1 , export2 } from "module-name";
import { export1 , export2 as alias2 } from "module-name";
import defaultExport, { export1 } from "module-name";
import defaultExport, * as name from "module-name";
import "module-name";
  `);

  expect(imports).toMatchInlineSnapshot(`
    Array [
      Object {
        "from": "module-name",
        "imports": Array [
          "default",
        ],
      },
      Object {
        "from": "module-name",
        "imports": Array [
          "*",
        ],
      },
      Object {
        "from": "module-name",
        "imports": Array [
          "export1",
        ],
      },
      Object {
        "from": "module-name",
        "imports": Array [
          "export1",
        ],
      },
      Object {
        "from": "module-name",
        "imports": Array [
          "export1",
          "export2",
        ],
      },
      Object {
        "from": "module-name",
        "imports": Array [
          "export1",
          "export2",
        ],
      },
      Object {
        "from": "module-name",
        "imports": Array [
          "default",
          "export1",
        ],
      },
      Object {
        "from": "module-name",
        "imports": Array [
          "default",
          "*",
        ],
      },
      Object {
        "from": "module-name",
        "imports": Array [],
      },
    ]
  `);
});
