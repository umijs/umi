import { isAbsolute, relative, resolve, sep } from 'path';

export function resolvePathWithinRoot(root: string, file: string) {
  const resolvedRoot = resolve(root);
  const filePath = resolve(resolvedRoot, `.${file}`);
  const relativePath = relative(resolvedRoot, filePath);

  if (
    relativePath === '..' ||
    relativePath.startsWith(`..${sep}`) ||
    isAbsolute(relativePath)
  ) {
    return null;
  }

  return filePath;
}
