# ssr-with-eggjs

## Install

```sh
$ yarn
```

## Usage

Development

```sh
$ npm run dev
$ open http://localhost:7001/
```

Build

```bash
$ npm run build
```
# globalization
 Currently it is selected in the order of cookie> browser default language> default language
 Since the server cannot get localStorage, it needs to be
 Bring the required information to the server

# Deployment
 Egg has built-in cluster mode, just execute yarn start, please refer to [egg official website](https://eggjs.org)
