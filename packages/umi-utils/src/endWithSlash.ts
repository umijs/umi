/**
 * Make up the ending slash path （ /abc => /abc/ ）
 * @param path string
 */
export default function endWithSlash(path: string) {
  return path.slice(-1) !== '/' ? `${path}/` : path;
}
