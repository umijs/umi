import { IApi } from 'umi';
import { crossSpawn, logger } from 'umi/plugin-utils';

// 运行 confetti 的代码
const handleConfetti = () => {
  // 问题: 运行时如果 raycast 是退出状态， 会自动打开 raycast 并在 mac 上显示。
  const confettiShell = `
    open raycast://confetti;
    exit;
  `;

  const confetti = crossSpawn(confettiShell, [], {
    stdio: 'pipe',
    shell: true,
  });

  confetti.on('error', (err) => {
    const errStr = '[confetti] ' + err;
    logger.error(errStr);
  });

  confetti.stderr &&
    confetti.stderr.on('data', () => {
      // 只有一行 shell ，报错可认为是 Raycast 没有正确访问
      const err = `[confetti] 未安装 Raycast , 请安装后尝试 https://www.raycast.com`;
      logger.error(err);
    });
};

export default (api: IApi) => {
  api.describe({
    key: 'confetti',
    config: {
      schema({ zod }) {
        return zod.object({});
      },
    },
    enableBy: api.EnableBy.config,
  });

  api.onBuildComplete(({ err }) => {
    if (!err) {
      handleConfetti();
    }
  });

  api.onDevCompileDone(({ isFirstCompile }) => {
    if (isFirstCompile) {
      // 首次构建运行
      handleConfetti();
    }
  });
};
