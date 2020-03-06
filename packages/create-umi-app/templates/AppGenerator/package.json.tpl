{
  "private": true,
  "scripts": {
    "start": "umi dev",
    "build": "umi build",
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
    "@umijs/preset-react": "1.x",
    "@umijs/test": "^{{{ version }}}",
    "lint-staged": "^10.0.7",
    "prettier": "^1.19.1",
    "react": "^16.12.0",
    "react-dom": "^16.12.0",
    "umi": "^{{{ version }}}",
    "yorkie": "^2.0.0"
  }
}
