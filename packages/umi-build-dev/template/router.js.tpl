import { Router as DefaultRouter, Route, Switch } from 'react-router-dom';
import dynamic from '<%= libraryName %>/dynamic';
<%= IMPORT %>

const Router = window.g_CustomRouter || DefaultRouter;

export default function() {
  return (
<%= ROUTER %>
  );
}
