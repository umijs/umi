export function winPath(path: string) {
  const isExtendedLengthPath = /^\\\\\?\\/.test(path);
  if (isExtendedLengthPath) {
    return path;
  }
  const escPath = path.replace(/'/g, "\\'");
  return escPath.replace(/\\/g, '/');
}
