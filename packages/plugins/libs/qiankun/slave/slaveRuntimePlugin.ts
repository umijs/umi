// @ts-nocheck
import qiankunRender, { contextOptsStack } from './lifecycles';

export function render(oldRender: any) {
  return qiankunRender().then(() => {
    // modifyContextOpts 调整到 render 之前执行，oldRender 应该在 qiankunRender 之后，子应用配置又是动态的，所以在这里取配置最合理
    const clientRenderOpts = contextOptsStack.shift();
    oldRender(clientRenderOpts);
  });
}
