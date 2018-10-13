---
sidebarDepth: 2
---

# Plugin

The key of umi that distinguishes it from other front-end development frameworks and tools is its plugin system. Based on the umi plugin system, you can get the compile-time and runtime capabilities of the extension project. The feature supported by the plugin will also become more powerful. For the needs of the feature, we can use the modified code package configuration, modify the bootstrap code, stipulate the directory structure, modify the HTML and other rich interfaces.

## Plugin usage

The plugin can be an npm package or a JS module that located with a path. You can register a plugin by configuring `plugins`. As follows:

```js
// .umirc.js
export default {
  plugins: [
    ['umi-plugin-dva', {
      immer: true,
    }],
    ['./src/plugins/customPlugin.js', {
      // plugin config
    }]
  ],
};
```

## Plugin list

### Official plugins

- [umi-plugin-react](/plugin/umi-plugin-react.html) (Plugin set)
- umi-plugin-dva
- umi-plugin-locale
- umi-plugin-dll
- umi-plugin-routes
- umi-plugin-polyfills

### Community plugins

- [umi-plugin-*](https://www.npmjs.com/search?q=umi-plugin-)
