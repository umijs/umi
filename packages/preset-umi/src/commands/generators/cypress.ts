import { GeneratorType } from '@umijs/core';
import { generateFile, logger } from '@umijs/utils';
import { existsSync, writeFileSync } from 'fs';
import { join } from 'path';
import { TEMPLATES_DIR } from '../../constants';
import { IApi } from '../../types';
import { GeneratorHelper } from './utils';

export default (api: IApi) => {
  api.describe({
    key: 'generator:cypress',
  });

  api.registerGenerator({
    key: 'cypress',
    name: 'Enable E2E Testing with Cypress',
    description: 'Setup Cypress Configuration',
    type: GeneratorType.enable,
    checkEnable: () => {
      return !existsSync(join(api.paths.cwd, 'cypress.config.ts'));
    },
    disabledDescription:
      'cypress has already enabled. You can remove cypress.config.ts, then run this again to re-setup.',
    fn: async () => {
      const h = new GeneratorHelper(api);

      const basicDeps = {
        cypress: '^10.0.0',
        'start-server-and-test': '^1.0.0',
      };

      h.addDevDeps(basicDeps);
      h.addScripts({
        e2e: 'cypress run',
        'e2e:ci': 'start-server-and-test preview http://127.0.0.1:9572  e2e',
      });
      h.appendGitIgnore(['/cypress/screenshots', '/cypress/videos']);

      writeFileSync(
        join(api.cwd, 'cypress.config.ts'),

        `
import { defineConfig } from "cypress";

const PORT = process.env.PORT || "8000";

export default defineConfig({
  e2e: {
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
    baseUrl: \`http://localhost:\${PORT}\`,
  },
});
`.trim(),
      );
      logger.info('Write cypress.config.ts');

      await generateFile({
        target: join(api.paths.cwd, 'cypress'),
        path: CYPRESS_TPL_FOLDER,
        baseDir: api.paths.cwd,
        data: {},
      });

      h.installDeps();
    },
  });
};

const CYPRESS_TPL_FOLDER = join(TEMPLATES_DIR, 'generate/cypress');
