# @umijs/plugin-webpack-5


Switch to webpack 5 in one click.

## How to enable

On by default.

## Introduction

Currently webpack 5 has not been officially released, using this plugin may step into the pit.

Contains features:

1. Enable webpack 5
1. Enable physical cache, fast second boot
1. node patch, currently has tty

problem:

1. I can't see the progress bar, because umi's built-in progress bar plugin does not support webpack 5
2. In dev mode, css will be typed into js, ​​instead of appearing as a separate css file, because the physical cache of mini-css-extract-plugin conflicts with webpack @ 5

## Configuration

This plugin is not configured yet.
