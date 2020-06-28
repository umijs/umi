/**
 * 为约定式路由中添加默认 404 路由
 *
 * 在有约定 /404.tsx 路由组件的情况下，
 * 给嵌套路由中的每一项 routes 末尾添加不匹配任何 path 的 404 路由
 */
import { IApi, IRoute } from '@umijs/types'


export const find404Route = (routes: IRoute[]): IRoute => {
  for (const route of routes) {
    if (route.path === '/404') {
      return route
    }
    if (route.routes) {
      return find404Route(route.routes)
    }
  }
}

export const addInsurance404 = (routes: IRoute[], notFoundRoute: IRoute) => {
  for (const route of routes) {
    if (route.routes) {
      addInsurance404(route.routes, notFoundRoute)
    }
  }

  routes.push(notFoundRoute)
}

export default (api: IApi) => {
  api.modifyRoutes((routes: IRoute[]) => {
    // https://umijs.org/config#exportstatic
    if (api.config.exportStatic) {
      return
    }

    const notFoundRoute = find404Route(routes)

    if (!notFoundRoute) {
      return routes
    }

    if (!notFoundRoute.component && !notFoundRoute.redirect) {
      throw new Error('Invalid route config for /404, no component and redirect')
    }

    const { component, redirect } = notFoundRoute

    addInsurance404(
      routes,
      notFoundRoute.component
        ? { component }
        : { redirect },
    )
  })
}
