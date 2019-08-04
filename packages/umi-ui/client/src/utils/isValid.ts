export const isValidFolderName = (name: string): boolean => {
  return (
    typeof name === 'string' &&
    !name.match(/[/@\s+%:]|^[_.]/) &&
    encodeURIComponent(name) === name &&
    name.length <= 100
  );
};
