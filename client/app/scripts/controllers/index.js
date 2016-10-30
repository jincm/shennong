'use strict';

/**
 * @ngdoc function
 * @name cbtNgCssApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the cbtNgCssApp
 */


angular.module('cbtNgCssApp')
  .controller('AppCtrl', [
    '$rootScope',
    '$scope',
    '$http',
    '$window',
    function ($rootScope, $scope, $http, $window) {
    this.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];

    //get server ip
    $http.get("config.json").success(function(response){
      $rootScope.app_ip = response.app_ip;
      console.log("ip is " + $rootScope.app_ip)
    });

    //handle toggle navbar
    $scope.currentIndex = 1; //default near is active
    $scope.handle_toggle = function(click_index) {
      $scope.currentIndex = click_index;
    };

    //test for user login and logout
    $scope.isLogin = function() {
      //console.log('check if is login');
      if($window.localStorage.getItem('name') !== 'jincm') {
        $scope.is_authed = false;
        console.log('has not login');
        return false;
      }
      else {
        $scope.is_authed = true;
        //console.log('has login');
        return true;
      }
    };
    //$window.localStorage.setItem('name','jincm');
    //console.log("main get is " + $window.localStorage.getItem('name'));
  }]);
