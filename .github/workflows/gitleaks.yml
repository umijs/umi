name: gitleaks

on: [push,pull_request]

jobs:
  gitleaks:
    runs-on: ubuntu-latest
    steps:
    - uses: actions/checkout@v1
    - name: gitleaks-action
      uses: zricethezav/gitleaks-action@master
