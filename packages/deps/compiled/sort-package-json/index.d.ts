/* eslint-disable @typescript-eslint/no-explicit-any */

declare namespace sortPackageJson {
  interface SortPackageJsonFn {
    /**
     * Sort packageJson object.
     *
     * @param packageJson - A packageJson
     * @param options - An options object
     * @returns Sorted packageJson object
     */
    <T extends Record<any, any>>(packageJson: T, options?: Options): T

    /**
     * Sort packageJson string.
     *
     * @param packageJson - A packageJson string.
     * @param options - An options object
     * @returns Sorted packageJson string.
     */
    (packageJson: string, options?: Options): string
  }

  type ComparatorFunction = (left: string, right: string) => number

  function sortObjectBy<T extends Record<any, any>>(
    comparator?: string[],
    deep?: boolean,
  ): (x: T) => T

  interface Field {
    readonly key: string
    over?<T extends Record<any, any>>(x: T): T
  }

  interface Options {
    readonly sortOrder?: readonly string[] | ComparatorFunction
  }
}

interface sortPackageJsonExports extends sortPackageJson.SortPackageJsonFn {
  readonly default: sortPackageJson.SortPackageJsonFn
  readonly sortPackageJson: sortPackageJson.SortPackageJsonFn
  readonly sortOrder: string[]
}

declare const sortPackageJsonExports: sortPackageJsonExports

export = sortPackageJsonExports
