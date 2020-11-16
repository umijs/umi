export default function compatESModuleRequire<
  T extends { __esModule: boolean; default: any }
>(m: T): T extends { __esModule: true; default: infer U } ? U : T {
  return m.__esModule ? m.default : m;
}
