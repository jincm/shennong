'use strict';

/**
 * @ngdoc overview
 * @name cbtNgCssApp
 * @description
 * # cbtNgCssApp
 *
 * Main module of the application.
 */
angular
  .module('cbtNgCssApp', [
    'ngAnimate',
    'ngCookies',
    'ngResource',
    'ngRoute',
    'ngSanitize',
    'ngTouch'
  ])
  .config(function ($routeProvider) {
    $routeProvider

      .when('/about', {
        templateUrl: 'views/about.html',
        controller: 'AboutCtrl',
        controllerAs: 'about'
      })
      .when('/login', {
        templateUrl: 'views/login.html',
        controller: 'LoginCtrl',
        controllerAs: 'login'
      })
      .when('/register', {
        templateUrl: 'views/register.html',
        controller: 'RegisterCtrl',
        controllerAs: 'register'
      })
      .when('/user', {
        templateUrl: 'views/user.html',
        controller: 'UserCtrl',
        controllerAs: 'user'
      })
      .when('/nearby', {
        templateUrl: 'views/nearby.html',
        controller: 'NearbyCtrl',
        controllerAs: 'nearby'
      })
      .when('/message', {
        templateUrl: 'views/message.html',
        controller: 'MessageCtrl',
        controllerAs: 'message'
      })
      .when('/contact', {
        templateUrl: 'views/contact.html',
        controller: 'ContactCtrl',
        controllerAs: 'contact'
      })
      .when('/youni', {
        templateUrl: 'views/youni.html',
        controller: 'YouniCtrl',
        controllerAs: 'youni'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
