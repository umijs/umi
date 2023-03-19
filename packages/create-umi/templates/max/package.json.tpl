{
  "private": true,
  "author": "{{{ author }}}",
  "scripts": {
    "dev": "max dev",
    "build": "max build",
    "format": "prettier --cache --write .",{{#withHusky}}
    "prepare": "husky install",{{/withHusky}}
    "postinstall": "max setup",
    "setup": "max setup",
    "start": "npm run dev"
  },
  "dependencies": {
    "@ant-design/icons": "^4.7.0",
    "@ant-design/pro-components": "^2.0.1",
    "@umijs/max": "{{{ version }}}",
    "antd": "^5.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",{{#withHusky}}
    "husky": "^8.0.1",{{/withHusky}}
    "lint-staged": "^13.0.3",
    "prettier": "^2.7.1",
    "prettier-plugin-organize-imports": "^2",
    "prettier-plugin-packagejson": "^2",
    "typescript": "^5.0.0"
  }
}
