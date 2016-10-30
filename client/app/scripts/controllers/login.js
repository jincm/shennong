'use strict';

/**
 * @ngdoc function
 * @name cbtNgCssApp.controller:LoginCtrl
 * @description
 * # LoginCtrl
 * Controller of the cbtNgCssApp
 */
angular.module('cbtNgCssApp')
  .controller('LoginCtrl', [
    '$scope',
    '$http',
    '$window',
    '$location',
    function ($scope, $http, $window, $location) {
    this.awesomeThings = [
      'HTML5 Boilerplate',
      'AngularJS',
      'Karma'
    ];

    console.log('login.js here and get name from localStorage is ' + $window.localStorage.getItem('name') );

    $scope.login = {};

    console.log("input is " + JSON.stringify($scope.login));

    $scope.mylogin = function () {
      //$scope.isUserAuth = !$scope.isUserAuth;
      console.log('login success and set name');
      $window.localStorage.setItem('name','jincm');
      $location.path('/user').replace();
    };
    $scope.myregister = function() {
      console.log("register here");
    };
    $scope.get_identify_code = function() {
      console.log("input is " + JSON.stringify($scope.login));
      //$scope.login.identify_code = 111;
      //var http_path = 'http://192.168.3.3:8080/api/v1/user/register?account=' + $scope.login.phone;
      //$http.jsonp(http_path).success(function(res) {
      //  console.log("response is " + res.body);
      //});

      //var promise = $http({
      //  method: 'POST',
      //  url: '/api/v1/user/register',
      //  data: {
      //    'account':$scope.login.phone
      //  }});
      var promise = $http({
        method: 'GET',
        url: '/api/v1/user/register',
        params: {
          'account':$scope.login.phone
        }});
      promise.success(function(data, status, config, headers){
        console.log("get_identify_code here;result is " + data);
        console.log("get_identify_code here;result is " + status);
        console.log("get_identify_code here;result is " + config);
        console.log("get_identify_code here;result is " + headers);
      });
      promise.error(function(data, status, config, headers){
        console.log("get_identify_code error;result is " + data);
        console.log("get_identify_code error;result is " + status);
        console.log("get_identify_code error;result is " + config);
        console.log("get_identify_code error;result is " + headers);
      });
      console.log("get_identify_code here;result is done");
    };

  }]);
