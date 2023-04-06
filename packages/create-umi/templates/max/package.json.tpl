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
    "@ant-design/icons": "^5.0.1",
    "@ant-design/pro-components": "^2.4.4",
    "@umijs/max": "{{{ version }}}",
    "antd": "^5.4.0"
  },
  "devDependencies": {
    "@types/react": "^18.0.33",
    "@types/react-dom": "^18.0.11",{{#withHusky}}
    "husky": "^8.0.3",{{/withHusky}}
    "lint-staged": "^13.2.0",
    "prettier": "^2.8.7",
    "prettier-plugin-organize-imports": "^3.2.2",
    "prettier-plugin-packagejson": "^2.4.3",
    "typescript": "^5.0.3"
  }
}
