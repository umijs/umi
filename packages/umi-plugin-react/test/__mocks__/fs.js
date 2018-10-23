const fs = jest.genMockFromModule('fs');

export function existsSync(path) {
  if (path === 'non-exist') {
    return false;
  }
  return true;
}

export default fs;
