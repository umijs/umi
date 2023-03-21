{
  "private": true,
  "author": "{{{ author }}}",
  "name": "umi-electron-app",
  "productionName": "{{{ productionName }}}",
  "version": "1.0.0",
  "scripts": {
    "dev": "umi dev",
    "build": "umi build",
    "postinstall": "umi setup",
    "setup": "umi setup",
    "start": "npm run dev"
  },
  "dependencies": {
    "umi": "{{{ version }}}"
  },
  "devDependencies": {
    "@tsconfig/node14": "^1.0.3",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "@umijs/plugin-electron": "^0.2.2",
    "electron": "23.1.1",
    "typescript": "^4.1.2"
  }
}
