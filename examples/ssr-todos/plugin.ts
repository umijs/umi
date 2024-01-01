import express from 'express';
import type { IApi } from 'umi';
const { todoServer } = require('./todo');

export default (api: IApi) => {
  api.onBeforeMiddleware(({ app }) => {
    app.use(express.json());
    todoServer(app);
  });
};
