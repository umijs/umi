# @umijs/plugin-crossorigin

为所有第三方脚本加上 `crossorigin="anonymous"` 属性，通常用于统计脚本错误。

* 在静态文件服务器添加 `Access-Control-Allow-Origin: *` 的前提下，通过在 script 标签上添加 `crossorigin="anonymous"` 来获取第三方脚本更为详细的 badjs 错误信息，便于错误日志上报。

* 相关代码参考( webkit )：
```c++
bool ScriptExecutionContext::sanitizeScriptError(String& errorMessage, int& lineNumber, String& sourceURL) {
  KURL targetURL = completeURL(sourceURL);

  if (securityOrigin()->canRequest(targetURL)) return false;
  // 触发 CORS 时，设置默认的有限报错信息
  errorMessage = "Script error.";
  sourceURL = String();
  ineNumber = 0;
  return true;
}
```


## 启用方式

配置开启。

## 配置

* Type: `boolean`
* Default: `false`

比如：

```js
export default {
  crossorigin: true,
}
```
