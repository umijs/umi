---
translateHelp: true
---

# Contributing


## Contribute Umi Core code

Refer to Umi's [CONTRIBUTING document](https://github.com/umijs/umi/blob/master/CONTRIBUTING.md).

## Contribute Umi official plugin

Refer to [CONTRIBUTING document](https://github.com/umijs/plugins/blob/master/CONTRIBUTING.md) of Umi Plugins.

## How to debug Umi code

Add `debugger` to the umi code, then execute the following command (make sure to execute `yarn build -w` to compile the source code)

```bash
# debugging umi dev
$ yarn debug examples/normal dev

# debugging umi build
$ yarn debug examples/normal build
```

![image](https://user-images.githubusercontent.com/13595509/82630300-e56b6d80-9c24-11ea-9966-5e9f38889518.png)

**Note**: Remember to delete `debugger` before submitting the code.

## Contributing documents

Umi uses Umi itself + dumi plug-in as a documentation tool,

1. There is "Edit this document on GitHub" at the bottom left of each document. You can modify the document here
2. Open the [docs on Github](https://github.com/umijs/umi/tree/master/docs) directory, use the file editor to create, modify, and preview files, and then submit a PR
3. You can also clone [Umi Repository](https://github.com/umijs/umi), modify the files in the docs directory, and pull up the PR after debugging the local documents
