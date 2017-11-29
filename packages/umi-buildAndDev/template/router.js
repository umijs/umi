import { Router, Route, Switch } from 'umi-router';
import dynamic from '<%= libraryName %>/dynamic';

export default function KoiRouter() {
  return (
<%= routeComponents %>
  );
}
