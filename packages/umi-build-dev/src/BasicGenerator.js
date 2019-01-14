import Generator from 'yeoman-generator';
const { existsSync } = require('fs');
const { join } = require('path');

class BasicGenerator extends Generator {
  constructor(args, opts) {
    super(args, opts);
    this.isTypeScript = existsSync(join(opts.env.cwd, 'tsconfig.json'));
  }
}

export default BasicGenerator;
