// This is an example function of clientLoader,
// it's import statement would be preserved but not bundled in loaders.js
export default function bigTask() {
  return new Promise<void>((resolve) => {
    setTimeout(() => {
      resolve();
    }, 1000);
  });
}
