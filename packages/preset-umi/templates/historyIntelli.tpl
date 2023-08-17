import { getRoutes } from './route'
import type { History } from '{{{ historyPath }}}'

type Routes = Awaited<ReturnType<typeof getRoutes>>['routes']
type AllRoute = Routes[keyof Routes]
type IsRoot<T extends any> = 'parentId' extends keyof T ? false : true

// show `/` in not `layout / wrapper` only
type GetAllRouteWithoutLayout<Item extends AllRoute> = Item extends any
  ? 'isWrapper' extends keyof Item
    ? never
    : 'isLayout' extends keyof Item
    ? never
    : Item
  : never
type AllRouteWithoutLayout = GetAllRouteWithoutLayout<AllRoute>
type IndexRoutePathname = '/' extends AllRouteWithoutLayout['path']
  ? '/'
  : never

type GetChildrens<T extends any> = T extends any
  ? IsRoot<T> extends true
    ? never
    : T
  : never
type Childrens = GetChildrens<AllRoute>
type Root = Exclude<AllRoute, Childrens>
type AllIds = AllRoute['id']

type GetChildrensByParentId<
  Id extends AllIds,
  Item = AllRoute
> = Item extends any
  ? 'parentId' extends keyof Item
    ? Item['parentId'] extends Id
      ? Item
      : never
    : never
  : never

type RouteObject<
  Id extends AllIds,
  Item = GetChildrensByParentId<Id>
> = IsNever<Item> extends true
  ? ''
  : Item extends AllRoute
  ? {
      [Key in Item['path'] as TrimSlash<Key>]: UnionMerge<
        RouteObject<Item['id']>
      >
    }
  : never

type GetRootRouteObject<Item extends Root> = Item extends Root
  ? {
      [K in Item['path'] as TrimSlash<K>]: UnionMerge<RouteObject<Item['id']>>
    }
  : never
type MergedResult = UnionMerge<GetRootRouteObject<Root>>

// --- patch history types ---

type HistoryTo = Parameters<History['push']>['0']
type HistoryPath = Exclude<HistoryTo, string>

type UmiPathname = Path<MergedResult> | (string & {})
interface UmiPath extends HistoryPath {
  pathname: UmiPathname
}
type UmiTo = UmiPathname | UmiPath

type UmiPush = (to: UmiTo, state?: any) => void
type UmiReplace = (to: UmiTo, state?: any) => void
{{#reactRouter5Compat}}
type UmiGoBack = () => void
{{/reactRouter5Compat}}


export interface UmiHistory extends History {
  push: UmiPush
  replace: UmiReplace
{{#reactRouter5Compat}}
  goBack: UmiGoBack
{{/reactRouter5Compat}}
}

// --- type utils ---
type TrimLeftSlash<T extends string> = T extends `/${infer R}`
  ? TrimLeftSlash<R>
  : T
type TrimRightSlash<T extends string> = T extends `${infer R}/`
  ? TrimRightSlash<R>
  : T
type TrimSlash<T extends string> = TrimLeftSlash<TrimRightSlash<T>>

type IsNever<T> = [T] extends [never] ? true : false
type IsEqual<A, B> = (<G>() => G extends A ? 1 : 2) extends <G>() => G extends B
  ? 1
  : 2
  ? true
  : false

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (
  k: infer I
) => void
  ? I
  : never
type UnionMerge<U> = UnionToIntersection<U> extends infer O
  ? { [K in keyof O]: O[K] }
  : never

type ExcludeEmptyKey<T> = IsEqual<T, ''> extends true ? never : T

type PathConcat<
  TKey extends string,
  TValue,
  N = TrimSlash<TKey>
> = TValue extends string
  ? ExcludeEmptyKey<N>
  :
      | ExcludeEmptyKey<N>
      | `${N & string}${IsNever<ExcludeEmptyKey<N>> extends true
          ? ''
          : '/'}${UnionPath<TValue>}`

type UnionPath<T> = {
  [K in keyof T]-?: PathConcat<K & string, T[K]>
}[keyof T]

type MakeSureLeftSlash<T> = T extends any
  ? `/${TrimRightSlash<T & string>}`
  : never

// exclude `/*`, because it always at the top of the IDE tip list
type Path<T, K = UnionPath<T>> = Exclude<MakeSureLeftSlash<K>, '/*'> | IndexRoutePathname
