import { existsSync, readFileSync, writeFileSync } from 'fs';
import { createHash } from 'crypto';
import { basename, dirname, join } from 'path';
import userHome from 'user-home';
import mkdirp from 'mkdirp';
import assert from 'assert';

interface IOpts {
  dbPath?: string;
}

export default class Config {
  dbPath: string;

  data: {
    projectsByKey?: any;
    currentProject?: string;
  };

  constructor(opts: IOpts = {}) {
    const { dbPath } = opts;
    this.dbPath = dbPath || join(userHome, '.umi/ui/data.json');
    mkdirp.sync(dirname(this.dbPath));
    this.load();
  }

  load() {
    if (existsSync(this.dbPath)) {
      this.data = JSON.parse(readFileSync(this.dbPath, 'utf-8'));
    } else {
      this.data = {};
    }

    if (!this.data.projectsByKey) {
      this.data.projectsByKey = {};
    }
  }

  save() {
    writeFileSync(this.dbPath, JSON.stringify(this.data, null, 2), 'utf-8');
  }

  addProject(path: string, name?: string) {
    name = name || basename(path);
    const str = `${path}____${name}`;
    const key = createHash('md5')
      .update(str)
      .digest('hex')
      .slice(0, 6);
    if (!this.data.projectsByKey[key]) {
      this.data.projectsByKey[key] = {
        path,
        name,
      };
      this.save();
    }
  }

  deleteProject(key) {
    delete this.data.projectsByKey[key];
    if (this.data.currentProject === key) {
      delete this.data.currentProject;
    }
    this.save();
  }

  editProject(key, newProps: Object) {
    this.data.projectsByKey[key] = {
      ...this.data.projectsByKey[key],
      ...newProps,
    };
    this.save();
  }

  setCurrentProject(key) {
    assert(this.data.projectsByKey[key], `project of key ${key} not found`);
    this.data.currentProject = key;
    this.save();
  }
}
