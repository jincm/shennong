'use strict';

/**
 * @ngdoc function
 * @name NgApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the NgApp
 */


angular.module('NgApp')
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

      $scope.is_login = function(){
        if($window.localStorage.getItem('name') != null) {
          $scope.is_authed = true;
          //console.log('has login: ' + $window.localStorage.getItem('name'));
          return true;
        }
        else {
          $scope.is_authed = false;
          //console.log('has not login: ' + $window.localStorage.getItem('name'));
          return false;
        }
      };

  }]);
