const JS_EXT_REGX = /\.(:?js|jsx|mjs|ts|tsx)$/;
export function isJavaScriptFile(f: string): boolean {
  return JS_EXT_REGX.test(f);
}
