type CSSModuleClasses = { readonly [key: string]: string }
declare module '*.less' {
  const classes: CSSModuleClasses
  export default classes
}
declare module '*.svg' {
  import * as React from 'react';
  export const ReactComponent: React.FunctionComponent<React.SVGProps<
  SVGSVGElement
  > & { title?: string }>;

  const src: string
  export default src
}
