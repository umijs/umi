export interface ILinterOpts {
  cwd: string;
}

export interface ILintArgs {
  _: string[];
  quiet?: boolean;
  fix?: boolean;
  eslintOnly?: boolean;
  stylelintOnly?: boolean;
  cssinjs?: boolean;
}
