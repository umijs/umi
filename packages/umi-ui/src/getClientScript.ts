import { readFileSync } from 'fs';

export default scripts => {
  return getFromScriptContent(
    scripts.map(script => {
      return readFileSync(script, 'utf-8');
    }),
  );
};

export const getBasicScriptContent = script => {
  const content = readFileSync(script, 'utf-8');
  return `
  window.g_uiBasicUI = [];
  const oldDefine = window.define;
  window.define = (deps, fn) => {
    const map = {
      react: window.React,
      'react-dom': window.ReactDOM,
      antd: window.antd,
    };
    if (!Array.isArray(deps)) {
      fn = deps;
      deps = [];
    }
    deps = deps.map(dep => {
      return map[dep];
    });
    window.g_uiBasicUI.push(fn.apply(null, deps));
  };
  define.amd = true;

  try {
    ${content}
  } catch (e) {
    console.error('basic script error', e);
  }

  window.define = oldDefine;`.trim();
};

export function getFromScriptContent(scripts) {
  return `
window.g_uiPlugins = [];
const oldDefine = window.define;
window.define = (deps, fn) => {
  const map = {
    react: window.React,
    'react-dom': window.ReactDOM,
    antd: window.antd,
  };
  if (!Array.isArray(deps)) {
    fn = deps;
    deps = [];
  }
  deps = deps.map(dep => {
    return map[dep];
  });
  window.g_uiPlugins.push(fn.apply(null, deps));
};
define.amd = true;

${scripts.map(getFromScript).join('\n\n')}

window.define = oldDefine;
  `.trim();
}

function getFromScript(script, index) {
  return `
/* Plugin: ${index} */
try {
  ${script}
} catch (e) {
  console.error('plugin ${index} error', e);
}
  `.trim();
}
