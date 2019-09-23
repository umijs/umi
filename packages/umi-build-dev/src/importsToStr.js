import { winPath } from 'umi-utils';

export default function(imports) {
  return imports.map(imp => {
    const { source, specifier } = imp;
    if (specifier) {
      return `import ${specifier} from '${winPath(source)}';`;
    } else {
      return `import '${winPath(source)}';`;
    }
  });
}
