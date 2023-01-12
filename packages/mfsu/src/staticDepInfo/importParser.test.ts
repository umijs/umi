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
    [
      {
        "from": "antd",
        "imports": [
          "*",
        ],
      },
      {
        "from": "antd",
        "imports": [
          "*",
        ],
      },
      {
        "from": "antd",
        "imports": [
          "name1",
          "name2",
          "nameN",
        ],
      },
      {
        "from": "antd",
        "imports": [
          "import1",
          "import2",
        ],
      },
      {
        "from": "antd",
        "imports": [
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
    [
      {
        "from": "module-name",
        "imports": [
          "default",
        ],
      },
      {
        "from": "module-name",
        "imports": [
          "*",
        ],
      },
      {
        "from": "module-name",
        "imports": [
          "export1",
        ],
      },
      {
        "from": "module-name",
        "imports": [
          "export1",
        ],
      },
      {
        "from": "module-name",
        "imports": [
          "export1",
          "export2",
        ],
      },
      {
        "from": "module-name",
        "imports": [
          "export1",
          "export2",
        ],
      },
      {
        "from": "module-name",
        "imports": [
          "default",
          "export1",
        ],
      },
      {
        "from": "module-name",
        "imports": [
          "default",
          "*",
        ],
      },
      {
        "from": "module-name",
        "imports": [],
      },
    ]
  `);
});
