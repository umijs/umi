export default function endWithSlash(path) {
  return path.slice(-1) !== '/' ? `${path}/` : path;
}
