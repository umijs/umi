# umi project d

## Getting Started

Install dependencies,

```bash
$ yarn
```

Start the dev server,

```bash
$ yarn dev
```

Start the prod server

```bash
$ yarn build
$ yarn start
```

# Globalization

- Currently it is selected in the order of cookie > browser default language > default language
- Since the server cannot get localStorage, it needs to be
- Bring the required information to the server

# Deployment

- When deploying, you can use pm2 to deploy (note that you need to use multi-process deployment)
- The static files are best placed on CDN, if they are placed on the server, it is best to use nginx to configure the static directory
