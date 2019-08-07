export const getBasename = (path: string): string => {
  return path
    .split('/')
    .filter(name => name)
    .slice(-1)[0];
};
