export interface ILinterOpts {
  cwd: string;
}

export interface ILintArgs {
  _: string[];
  fix?: boolean;
  eslintOnly?: boolean;
  stylelintOnly?: boolean;
  cssinjs?: boolean;
}
