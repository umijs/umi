export const getTocTitle = (title: string) => {
  return title
    .trim()
    .replace(/\\{/g, '{')
    .replace(/\\}/g, '}')
    .replace(/[`]/g, '');
};

export default getTocTitle;
