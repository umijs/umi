export const getVersionMajor = (version: string) => {
  return version.match(/(?<=\~|\^)\d|^\d/)?.[0];
};
