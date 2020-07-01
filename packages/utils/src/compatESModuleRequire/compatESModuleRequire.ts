export default function compatESModuleRequire<T extends any>(
  m: T,
): T extends { __esModule: true; default: infer U } ? U : T {
  // @ts-ignore
  return m.__esModule ? m.default : m;
}
