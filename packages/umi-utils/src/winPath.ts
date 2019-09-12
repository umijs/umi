import slash from 'slash2';

/**
 * Convert Windows backslash paths to slash paths
 * @param path
 */
export default function(path: string): string {
  return slash(path);
}
