(function (factory) {
  typeof define === 'function' && define.amd ? define(factory) :
  factory();
}(function () { 'use strict';

  var foo = {
    a: function a() {
      return 'a';
    },
    b: function b() {
      return 'b';
    }
  };

  console.log(foo.a());
  console.log(foo.b());

}));
