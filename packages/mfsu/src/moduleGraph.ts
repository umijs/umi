import type { DepModule } from './depInfo';

class ModuleNode {
  file: string;
  importers = new Set<ModuleNode>();
  importedModules = new Set<ModuleNode>();
  isDependency: boolean = false;
  isRoot: boolean = false;
  version: string | null = null;

  constructor(file: string) {
    this.file = file;
  }
}

interface IDep {
  file: string;
  isDependency: boolean;
  version?: string;
}

export class ModuleGraph {
  fileToModules = new Map<string, ModuleNode>();
  depToModules = new Map<string, ModuleNode>();
  depSnapshotModules: Record<string, DepModule> = {};
  rootModules = new Set<ModuleNode>();

  constructor() {}

  restore(data: {
    roots: any;
    fileModules: any;
    depModules: any;
    depSnapshotModules: any;
  }) {
    const getModuleNode = (file: string) => {
      if (this.fileToModules.has(file)) {
        return this.fileToModules.get(file)!;
      }
      if (this.depToModules.has(file)) {
        return this.depToModules.get(file)!;
      }

      const mod = new ModuleNode(file);

      return mod;
    };

    const addNode = ({ file, importer }: any) => {
      const mod = getModuleNode(file);

      let isDependency = false;
      let info;
      if (data.fileModules[file]) {
        info = data.fileModules[file];
      } else if (data.depModules[file]) {
        info = data.depModules[file];
        isDependency = true;
      }
      if (info.isRoot) mod.isRoot = true;
      if (importer) {
        mod.importers.add(importer);

        if (!importer.importedModules.has(mod)) {
          importer.importedModules.add(mod);
        } else {
          return;
        }
      }
      mod.isDependency = isDependency;
      if (info.version !== undefined) {
        mod.version = info.version;
      }
      if (isDependency) {
        this.depToModules.set(file, mod);
      } else {
        this.fileToModules.set(file, mod);
        for (const importedModule of info.importedModules) {
          addNode({ file: importedModule, importer: mod });
        }
      }
    };
    for (const root of data.roots) {
      addNode({ file: root });
    }

    this.depSnapshotModules = data.depSnapshotModules;
  }

  toJSON() {
    const roots: string[] = [];
    const fileModules: Record<
      string,
      { importedModules: string[]; isRoot?: boolean }
    > = {};
    const depModules: Record<string, { version: string | null }> = {};
    this.depToModules.forEach((value, key) => {
      depModules[key] = {
        version: value.version,
      };
    });
    this.fileToModules.forEach((value, key) => {
      fileModules[key] = {
        importedModules: Array.from(value.importedModules).map(
          (item) => item.file,
        ),
      };
      if (value.isRoot) {
        fileModules[key].isRoot = true;
        roots.push(key);
      }
    });
    return {
      roots,
      fileModules,
      depModules,
      depSnapshotModules: this.depSnapshotModules,
    };
  }

  snapshotDeps() {
    this.depSnapshotModules = this.getDepsInfo(this.depToModules);
  }

  getDepsInfo(mods: Map<string, ModuleNode>) {
    return Array.from(mods.keys()).reduce<
      Record<string, { file: string; version: string }>
    >((memo, key) => {
      memo[key] = this.getDepInfo(mods.get(key)!);
      return memo;
    }, {});
  }

  getDepInfo(mod: ModuleNode) {
    const [importer] = mod.importers;

    return {
      file: mod.file,
      version: mod.version!,
      importer: importer?.file,
    };
  }

  hasDepChanged() {
    const depModulesInfo = this.getDepsInfo(this.depToModules);

    const depKeys = Object.keys(depModulesInfo);
    const snapshotKeys = Object.keys(this.depSnapshotModules);

    if (depKeys.length !== snapshotKeys.length) {
      return true;
    }

    for (const k of depKeys) {
      const dep = depModulesInfo[k];
      const snapshot = this.depSnapshotModules[k];
      if (dep.file !== snapshot?.file) {
        return true;
      }

      if (dep.version !== snapshot?.version) {
        return true;
      }
    }

    return false;
  }

  onFileChange(opts: { file: string; deps: IDep[] }) {
    if (this.fileToModules.has(opts.file)) {
      const mod = this.fileToModules.get(opts.file)!;
      this.updateModule({
        mod,
        deps: opts.deps,
      });
    } else {
      const mod = new ModuleNode(opts.file);
      mod.isRoot = true;
      this.fileToModules.set(opts.file, mod);
      this.rootModules.add(mod);
      opts.deps.forEach((dep) => {
        this.addNode({
          file: dep.file,
          isDependency: dep.isDependency,
          version: dep.version || null,
          importer: mod,
        });
      });
    }
  }

  updateModule(opts: { mod: ModuleNode; deps: IDep[] }) {
    const importedModulesMap = Array.from(opts.mod.importedModules).reduce<
      Record<string, any>
    >((memo, mod) => {
      memo[mod.file] = mod;
      return memo;
    }, {});

    const newDeps = [];
    for (const dep of opts.deps) {
      // update
      if (importedModulesMap[dep.file]) {
        if (dep.version !== undefined) {
          importedModulesMap[dep.file].version = dep.version;
        }
        delete importedModulesMap[dep.file];
      }
      // add
      else {
        newDeps.push(dep);
      }
    }
    Object.keys(importedModulesMap).forEach((key) => {
      this.deleteNode({ mod: importedModulesMap[key], importer: opts.mod });
    });
    newDeps.forEach((dep) => {
      this.addNode({ ...dep, importer: opts.mod });
    });
  }

  addNode(opts: {
    file: string;
    isDependency: boolean;
    importer: ModuleNode;
    version?: string | null;
  }) {
    const modules = opts.isDependency ? this.depToModules : this.fileToModules;
    let mod: ModuleNode;
    if (modules.has(opts.file)) {
      mod = modules.get(opts.file)!;
      if (opts.version !== undefined) mod.version = opts.version;
    } else {
      mod = new ModuleNode(opts.file);
      mod.isDependency = opts.isDependency;
      if (opts.version !== undefined) mod.version = opts.version;
      modules.set(opts.file, mod);
    }
    if (!mod.importers.has(opts.importer)) {
      mod.importers.add(opts.importer);
    }
    if (!opts.importer.importedModules.has(mod)) {
      opts.importer.importedModules.add(mod);
    }
  }

  deleteNode(opts: { mod: ModuleNode; importer: ModuleNode }) {
    const modules = opts.mod.isDependency
      ? this.depToModules
      : this.fileToModules;
    const { mod, importer } = opts;
    mod.importers.delete(opts.importer);
    importer.importedModules.delete(mod);
    if (!mod.importers.size) {
      modules.delete(opts.mod.file);
      mod.importedModules.forEach((importedModule) => {
        this.deleteNode({
          mod: importedModule,
          importer: mod,
        });
      });
    }
  }
}
