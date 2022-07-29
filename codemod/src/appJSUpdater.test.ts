import { update } from './appJSUpdater';

test('set', () => {
  expect(
    update({
      code: ``,
      filePath: ``,
      updates: {
        set: { layout: { icon: 'icon.png' } },
      },
    }).code,
  ).toEqual(`export const layout = () => ({ icon: "icon.png" });`);
});

test('set with exists', () => {
  expect(
    update({
      code: `export const layout = () => { return { logo: '1' } }`,
      filePath: ``,
      updates: {
        set: { layout: { icon: 'icon.png' } },
      },
    }).code,
  ).toEqual(
    `export const layout = () => {return { logo: '1', icon: "icon.png" };};`,
  );
});

test('set with cover', () => {
  expect(
    update({
      code: `const layout = () => { return { logo: '1' } };export { layout }`,
      filePath: ``,
      updates: {
        set: { layout: { icon: 'icon.png' } },
      },
    }).code,
  ).toEqual(
    `const layout = () => {return { logo: '1', icon: "icon.png" };};export { layout };`,
  );
});
