import { realpathSync } from 'fs';
import { isAbsolute, relative, resolve, sep } from 'path';

function isInDirectory(root: string, file: string) {
  const name = relative(root, file);
  return name !== '..' && !name.startsWith(`..${sep}`) && !isAbsolute(name);
}

export function isMissingAsset(err: unknown) {
  const { code } = err as NodeJS.ErrnoException;
  return code === 'ENOENT' || code === 'ENOTDIR' || code === 'ELOOP';
}

// The URL path is relative to the mount point. Resolve both the requested
// name and the filesystem target so links inside the output obey the same rule.
export function resolveAssetPath(
  output: string,
  urlPath: string,
  dotfiles: 'allow' | 'ignore' = 'allow',
) {
  let name: string;
  try {
    name = decodeURIComponent(urlPath);
  } catch {
    return;
  }
  if (isAbsolute(name) || name.includes('\0')) return;
  if (
    dotfiles === 'ignore' &&
    name.split(/[/\\]/).some((part) => part.startsWith('.') && part.length > 1)
  ) {
    return;
  }

  const target = resolve(output, name);
  if (!isInDirectory(output, target)) return;

  try {
    const file = realpathSync(target);
    const root = realpathSync(output);
    if (isInDirectory(root, file)) return { root, file };
  } catch (err) {
    if (!isMissingAsset(err)) throw err;
  }
}
