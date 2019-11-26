import { existsSync, readFileSync, writeFileSync } from 'fs';
import { createHash } from 'crypto';
import { get, pickBy, identity } from 'lodash';
import { basename, dirname, join } from 'path';
import { homedir } from 'os';
import mkdirp from 'mkdirp';
import assert from 'assert';

interface IOpts {
  dbPath?: string;
  onSave?: any;
}

export interface ICreateProgress {
  step: number;
  stepStatus: number;
  steps: string[];
  success?: boolean;
  failure?: Error;
}

export interface IProjectItem {
  name: string;
  path: string;
  creatingProgress?: ICreateProgress;
  created_at?: number;
  npmClient?: string;
  createOpts?: any;
}

interface IProjectsByKey {
  [key: string]: IProjectItem;
}

export default class Config {
  dbPath: string;

  data: {
    projectsByKey?: IProjectsByKey;
    currentProject?: string;
  };

  onSave: any;

  constructor(opts: IOpts = {}) {
    const { dbPath, onSave } = opts;
    this.dbPath =
      dbPath ||
      join(homedir(), `.umi/ui/${process.env.BIGFISH_COMPAT ? 'bigfish-data' : 'data'}.json`);
    this.onSave = onSave;
    mkdirp.sync(dirname(this.dbPath));
    this.load();
  }

  load() {
    if (existsSync(this.dbPath)) {
      try {
        this.data = JSON.parse(readFileSync(this.dbPath, 'utf-8'));
      } catch (e) {
        this.data = {};
      }
    } else {
      this.data = {};
    }

    if (!this.data.projectsByKey) {
      this.data.projectsByKey = {};
    }
  }

  save() {
    writeFileSync(this.dbPath, JSON.stringify(this.data, null, 2), 'utf-8');
    if (this.onSave) this.onSave(this.data);
  }

  addProject({
    name,
    path,
    npmClient,
    createOpts,
    ignoreExistsCheck,
  }: {
    path: string;
    name: string;
    npmClient?: string;
    createOpts?: any;
    ignoreExistsCheck?: boolean;
  }): string {
    name = name || basename(path);
    const str = `${path}____${name}`;
    const key = createHash('md5')
      .update(str)
      .digest('hex')
      .slice(0, 6);
    if (!ignoreExistsCheck) {
      assert(!this.data.projectsByKey[key], `Key of path ${path} exists, please try another one.`);
    }
    this.data.projectsByKey[key] = {
      path,
      name,
      created_at: +new Date(),
      npmClient,
      createOpts,
    };
    this.save();
    return key;
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
      ...pickBy(newProps, identity),
    };
    this.save();
  }

  setCreatingProgress(key, args) {
    // KEY
    // step: 1,
    // stepStatus: 'loading',
    // steps: [''],
    this.data.projectsByKey[key].creatingProgress = {
      ...this.data.projectsByKey[key].creatingProgress,
      ...args,
    };
    this.save();
  }

  setCreatingProgressDone(key) {
    delete this.data.projectsByKey[key].creatingProgress;
    this.save();
  }

  setCurrentProject(key) {
    assert(this.data.projectsByKey[key], `project of key ${key} not found`);
    assert(
      get(this.data, `projectsByKey.${key}.creatingProgress.success`) ||
        !get(this.data, `projectsByKey.${key}.creatingProgress`),
      `project of key ${key} is still creating`,
    );
    this.data.currentProject = key;
    this.save();
  }

  clearCurrentProject() {
    this.data.currentProject = null;
    this.save();
  }

  setProjectNpmClient({ npmClient, key }: { npmClient: string; key: string }) {
    this.data.projectsByKey[key].npmClient = npmClient;
    this.save();
  }

  addProjectWithPath(projectPath: string) {
    const absProjectPath = join(projectPath);
    const pathArray = absProjectPath.split('/');
    const projectName = pathArray[pathArray.length - 1];
    return this.addProject({
      name: projectName,
      path: absProjectPath,
      ignoreExistsCheck: true,
    });
  }

  getKeyOrAddWithPath(projectPath: string) {
    const keys = Object.keys(this.data.projectsByKey);
    for (const key of keys) {
      if (this.data.projectsByKey[key].path === projectPath) {
        return key;
      }
    }
    return this.addProjectWithPath(projectPath);
  }

  checkValid() {
    for (const key of Object.keys(this.data.projectsByKey)) {
      const { path } = this.data.projectsByKey[key];
      // 删除不存在的项目
      if (!existsSync(path)) {
        delete this.data.projectsByKey[key];
        if (this.data.currentProject === key) {
          this.data.currentProject = null;
        }
      }
    }
  }
}
