'use strict';

/**
 * @ngdoc function
 * @name NgApp.controller:UserCtrl
 * @description
 * # UserCtrl
 * Controller of the NgApp
 */
angular.module('NgApp')
  .controller('UserCtrl', function ($scope, $window, $location) {
    this.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
    console.log("auth is " + $scope.is_authed + " url is " + $location.path());
    $scope.logout = function () {
      console.log('logout success and clear');
      $window.localStorage.removeItem('name');
      $scope.is_authed = false;
      $location.path('/#').replace();
      //$window.location.href = '/#/'
    };
  });
