export default function getLinkFromTitle(title: string) {
  return title
    .toLowerCase()
    .replace(/\s/g, '-')
    .replace(/[（）()\\{},]/g, '');
}
