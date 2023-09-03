# Contributing

## Contributing to Umi Core Code

Please refer to Umi's [CONTRIBUTING documentation](https://github.com/umijs/umi/blob/master/CONTRIBUTING.md).

## Contributing to Official Umi Plugins

Please refer to the CONTRIBUTING documentation for Umi Plugins [here](https://github.com/umijs/plugins/blob/master/CONTRIBUTING.md).

## How to Debug Umi Code

To debug Umi code, add `debugger` statements in the Umi codebase and then execute the following commands (make sure to run `yarn build -w` to compile the source code):

```bash
# Debug umi dev
$ yarn debug examples/normal dev

# Debug umi build
$ yarn debug examples/normal build
```

![image](https://user-images.githubusercontent.com/13595509/82630300-e56b6d80-9c24-11ea-9966-5e9f38889518.png)

**Note**: Remember to remove the `debugger` statements before submitting your code.

## Contributing to Documentation

Umi uses Umi itself along with the dumi plugin for documentation purposes.

1. Each document has an "Edit this document on GitHub" link at the bottom left, which you can use to make document modifications.
2. Open the [docs directory on GitHub](https://github.com/umijs/umi/tree/master/docs), use a file editor to create, modify, and preview files, and then submit a pull request.
3. You can also clone the [Umi repository](https://github.com/umijs/umi), make changes to files in the docs directory, and submit a pull request after completing local documentation debugging.
