// @ts-ignore
import isUrl from 'is-url';

/**
 * Check whether a string is a URL.
 * @param path
 */
export default function(path: string): boolean {
  return isUrl(path);
}
