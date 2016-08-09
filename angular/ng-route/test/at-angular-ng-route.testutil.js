/* global angular */
'use strict';

function buildNamespace(base, name, value) {
  var parts = name.split('.');
  for (var i = 0; i < parts.length - 1; i++) {
    var part = parts[i];
    base[part] = base[part] || {};
    base = base[part];
  }
  base[parts[parts.length - 1]] = value;
}

var adobe = {
  target: {
    ext: {},
    registerExtension: function (params) {
      var exposedModules = {
        settings: {
          defaultContentHiddenStyle: 'visibility:hidden;',
          defaultContentVisibleStyle: 'visibility:visible;',
          bodyHiddenStyle: 'body{display:none}',
          bodyHidingEnabled: true,
          globalMboxAutoCreate: false,
          timeout: 5000,
          pollingAfterDomReadyTimeout: 2000
        },
        logger: console
      };

      var args = [];
      params.modules.forEach(function (elem) {
        args.push(exposedModules[elem]);
      });

      buildNamespace(adobe.target.ext, params.name, params.register.apply(null, args));
    },
    getOffer: function (opts) {
      var offer = '<p>Sample Offer</p>';
      opts.success(offer);
    },
    applyOffer: function (opts) {
    }
  }
};

var app = angular.module('myApp', ['ngRoute'])
  .config(['$routeProvider', function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'test/home.html',
        controller: 'HomeController'
      })
      .when('/blog', {
        templateUrl: 'test/blog.html',
        controller: 'BlogController'
      })
      .otherwise({redirectTo: '/'});
  }]
);

app.controller('HomeController', function ($scope) {
  $scope.message = 'Hello from HomeController';
});

app.controller('BlogController', function ($scope) {
  $scope.message = 'Hello from BlogController';
});
