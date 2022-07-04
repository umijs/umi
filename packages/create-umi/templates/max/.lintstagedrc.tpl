{
  "*.{md,json}": [
    "prettier --write"
  ],
  "*.{js,jsx}": [
    "max lint --fix --eslint-only",
    "prettier --write"
  ],
  "*.{css,less}": [
    "max lint --fix --stylelint-only",
    "prettier --write"
  ],
  "*.ts?(x)": [
    "max lint --fix --eslint-only",
    "prettier --parser=typescript --write"
  ]
}
