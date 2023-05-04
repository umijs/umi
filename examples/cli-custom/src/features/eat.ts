import { IApi } from 'umi';

export default (api: IApi) => {
  api.describe({
    key: 'eat',
    config: {
      schema({ zod }) {
        return zod.array(zod.string());
      },
    },
  });

  api.registerCommand({
    name: 'eat',
    fn: () => {
      const foods = ['🍎', '🍌', ...(api.userConfig.eat || [])];
      const food = foods[Math.floor(Math.random() * foods.length)];
      console.log(`eat ${food}`);
    },
  });
};
