import { App, message as antdMessage } from 'antd';
import * as React from 'react';

let appInstance: any;

export const AppProxy: React.FC = () => {
  appInstance = App.useApp();

  return null;
};

export const message = {};
Object.keys(antdMessage).forEach((key) => {
  message[key] = (...args) => appInstance.message[key](...args);
});
