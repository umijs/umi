import React from 'react';
// @ts-ignore
import { _LocaleContainer } from './locale';
{{#Title}}
import { getIntl, getLocale } from './localeExports';
{{/Title}}
export function i18nProvider(container: Element) {
  return React.createElement(_LocaleContainer, null, container);
}

{{#Title}}
export function patchRoutes({ routes }) {
  // loop all route for patch title field
  const intl = getIntl(getLocale());
  const traverseRoute = (routes) => {
    Object.keys(routes).forEach((key) => {
      const route = routes[key];
      if (route.title) {
        route.locale = route.title;
        const newTitle = intl.messages[route.title] ? intl.formatMessage({ id: route.title }, {}) : route.title;
        route.name = intl.messages[route.title] ? intl.formatMessage({ id: route.title }, {}) : route.name;
        route.title = newTitle;
      }
      if (route.routes) {
        traverseRoute(route.routes);
      }
      if (route.children) {
        traverseRoute(route.children);
      }
    })
  }
  traverseRoute(routes);
}
{{/Title}}
