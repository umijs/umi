import { join } from 'path';

const checkEsLint = (pkg = {}) => {
  const { devDependencies, dependencies } = pkg;
  const hasOtherEslint = Object.keys({ ...devDependencies, ...dependencies }).filter(
    key => key.includes('eslint-config') || key.includes('eslint-plugin'),
  );
  console.log;
};

export default function(api) {
  const { cwd } = api;
  const pkg = join(cwd, './package.json');
}
