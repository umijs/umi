import { Generator } from '@umijs/utils';
import { join } from 'path';

export default class AppGenerator extends Generator {
  async writing() {
    this.copyDirectory({
      context: {},
      path: join(__dirname, '../../templates/AppGenerator'),
      target: this.cwd,
    });
  }
}
