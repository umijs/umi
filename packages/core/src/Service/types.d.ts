interface IDep {
  [name: string]: string;
}

interface IPackage {
  dependencies?: IDep;
  devDependencies?: IDep;
}

interface IPlugin {
  id: string;
  // Currently only used for config
  key: string;
  path: string;
  apply: Function;
  defaultConfig: any;

  isPreset?: boolean;
  api?: any;
}

interface IPreset extends IPlugin {}
