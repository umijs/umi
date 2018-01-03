import { Router, Route, Switch } from 'umi-router';
import dynamic from '<%= libraryName %>/dynamic';
import { default as event, Events } from '<%= libraryName %>/event';

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
