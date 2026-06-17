import { isAbsolute, relative, resolve } from 'path';

export function resolvePathWithinRoot(root: string, file: string) {
  const resolvedRoot = resolve(root);
  const filePath = resolve(resolvedRoot, `.${file}`);
  const relativePath = relative(resolvedRoot, filePath);

  if (relativePath.startsWith('..') || isAbsolute(relativePath)) {
    return null;
  }

  return filePath;
}
