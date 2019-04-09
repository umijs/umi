import React from 'react';

var Foo = (function () {
  return React.createElement("h1", null, "Foo");
});

var index = (function () {
  return React.createElement(Foo, null);
});

export default index;
