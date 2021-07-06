{
  "private": true,
  "scripts": {
    "start": "umi dev",
    "build": "umi build",
    "postinstall": "umi generate tmp",
    "prettier": "prettier --write '**/*.{js,jsx,tsx,ts,less,md,json}'",
    "test": "umi-test",
    "test:coverage": "umi-test --coverage"
  },
  "gitHooks": {
    "pre-commit": "lint-staged"
  },
  "lint-staged": {
    "*.{js,jsx,less,md,json}": [
      "prettier --write"
    ],
    "*.ts?(x)": [
      "prettier --parser=typescript --write"
    ]
  },
  "dependencies": {
    "@ant-design/pro-layout": "^6.5.0",
    "react": "17.x",
    "react-dom": "17.x",
    "umi": "^{{{ version }}}"
  },
  "devDependencies": {
    "@types/react": "^17.0.0",
    "@types/react-dom": "^17.0.0",
    "@umijs/preset-react": "1.x",
    "@umijs/test": "^{{{ version }}}",
    "lint-staged": "^10.0.7",
    "prettier": "^2.2.0",
    "typescript": "^4.1.2",
    "yorkie": "^2.0.0"
  }
}
