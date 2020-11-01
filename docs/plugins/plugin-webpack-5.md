---
translateHelp: true
---

# @umijs/plugin-webpack-5


Switch to webpack 5 with one click.

## How to enable

It is turned on by default.

## Introduction

At present, webpack 5 has not been officially released, and using this plugin may be a pit.

Contains functions:

1. Enable webpack 5
1. Enable the physical cache, the second start is extremely fast
1. Node patch, currently has tty

problem:

1. The progress bar cannot be seen because the built-in progress bar plugin of umi does not support webpack 5
2. In dev mode, css will be typed into js instead of a separate css file, because mini-css-extract-plugin conflicts with the physical cache of webpack@5

## Configuration

There is currently no configuration for this plugin.
