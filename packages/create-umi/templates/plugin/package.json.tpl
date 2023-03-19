{
  "name": "{{{ pluginName }}}",
  "author": "{{{ author }}}",
  "version": "0.0.1",
  "main": "dist/cjs/index.js",
  "types": "dist/cjs/index.d.ts",
  "scripts": {
    "dev": "father dev",
    "build": "father build"
  },
  "keywords": [],
  "authors": {
    "name": "{{{ author }}}",
    "email": "{{{ email }}}"
  },
  "license": "MIT",
  "files": [
    "dist"
  ],
  "devDependencies": {
    "father": "^4.0.0",
    "umi": "{{{ version }}}",
    "@types/node": "^18.0.0",
    "typescript": "^5.0.0"
  }
}
