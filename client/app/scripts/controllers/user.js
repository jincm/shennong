'use strict';

/**
 * @ngdoc function
 * @name cbtNgCssApp.controller:UserCtrl
 * @description
 * # UserCtrl
 * Controller of the cbtNgCssApp
 */
angular.module('cbtNgCssApp')
  .controller('UserCtrl', function ($scope, $window, $location) {
    this.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];
    console.log("auth is " + $scope.isUserAuth + " url is " + $location.path());
    $scope.logout = function () {
      console.log('logout success and clear');
      $window.localStorage.removeItem('name');
    };
  });
