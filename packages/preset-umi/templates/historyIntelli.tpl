import { getRoutes } from './route'
import type { History } from '{{{ historyPath }}}'

type Routes = {{{ routes }}}

// --- patch history types ---

type HistoryTo = Parameters<History['push']>['0']
type HistoryPath = Exclude<HistoryTo, string>

type UmiPathname = Routes | (string & {})
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
