import isUrl from 'is-url';

export default function(path) {
  return isUrl(path);
}
