import { Router as DefaultRouter, Route, Switch } from 'react-router-dom';
import dynamic from '<%= libraryName %>/dynamic';
import { default as event, Events } from '<%= libraryName %>/event';
<%= codeForPlugin %>

const Router = window.g_CustomRouter || DefaultRouter;

export default function() {

  function callback(key, err) {
    if (!err) {
      event.emit(Events.PAGE_INITIALIZED, { key });
    }
  }

  return (
<%= routeComponents %>
  );
}
